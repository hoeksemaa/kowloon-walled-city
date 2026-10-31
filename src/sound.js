// A gentle sound layer: a soft bed of the dense city, with an occasional clear sound over it.
// Web Audio synthesis only, with no audio files. It is off until the user turns it on,
// because a browser plays no sound before a click or a key.
//
// SOURCED: "buzzing electrical wires, dripping pipes", night and day (a police officer posted
// there in 1987, SCMP 2018); "the constant dripping" (City of Darkness Revisited, pp148–149)
// and "the sound of water dripping" at night (Tam Sau-kuen, WSJ 2014); planes so loud that
// people stopped talking until they passed (the tailor, HK01 2022); Chan Kwan Leung whistled
// before he fed his pigeons (p320), and flew them "usually in mid-afternoon when there was a
// lull in the number of landings at Kai Tak" (p321); "people were cooking; sounds came out all
// the time" (Girard, HK01 2024); mahjong after work (林羅平, HK01 2024); ping pong in the
// hallway (Albert Ng, SCMP 2013).
// INFERRED: the loudness through the day, the hours of each sound, the loom (the weaving
// workshops are sourced, p48, but not their sound), and the shape of every sound. The planes
// play much softer than they were. Sounds follow the clock, not the camera.
import { mulberry32, clamp } from './util.js';

const SAT = 4, SUN = 5, DONGZHI = 6; // days from Tue 16 Dec 1986, as in people.js
const MASTER = 0.5;
const MAX_SPEED = 60; // above this, the bed only

// How full the city sounds, 0–1, by the hour: quiet from 1 to 5 a.m., full by day.
const LEVEL = [[0, 0.5], [1, 0.25], [5, 0.2], [6.5, 0.5], [8, 0.9], [12, 1], [14, 0.9], [18, 1], [21, 0.8], [23, 0.6], [24, 0.5]];
export function bedLevel(day, minute) {
  const h = clamp(minute / 60, 0, 24);
  let i = 1;
  while (i < LEVEL.length - 1 && LEVEL[i][0] < h) i++;
  const [h0, v0] = LEVEL[i - 1], [h1, v1] = LEVEL[i];
  let v = v0 + ((v1 - v0) * (h - h0)) / (h1 - h0);
  if (day === SUN && h > 7) v *= 0.85; // most workshops shut
  if (day === DONGZHI && h >= 17.5 && h < 21) v = Math.min(1, v + 0.1); // 冬至 dinners
  return v;
}

// The clear sounds that can come now, with their weights. The hours are INFERRED.
export function cues(day, minute) {
  const h = minute / 60;
  const work = day !== SUN && h >= 8 && h < (day === DONGZHI ? 17.5 : 19);
  const late = h >= 19.5 || h < 1;
  return {
    loom: work ? 1 : 0,
    cook: h >= 11.5 && h < 13 ? 0.8 : h >= 17.5 && h < 20 ? (day === DONGZHI ? 2 : 1) : 0,
    mahjong: late ? (day === SAT || day === DONGZHI ? 1.2 : 0.6) : 0,
    pong: h >= 19 && h < 22 ? (day === SAT ? 1 : 0.5) : 0,
    flock: h >= 14.5 && h < 16.5 ? 0.6 : 0,
  };
}

// The minute of the pigeons' feed: the middle of the longest gap between landings
// with its middle from 14:30 to 16:30 (p321).
export function lull(times) {
  const ts = times.filter((m) => m > 780 && m < 1080).sort((a, b) => a - b);
  let best = 930, gap = 0;
  for (let i = 1; i < ts.length; i++) {
    const mid = (ts[i - 1] + ts[i]) / 2;
    if (mid >= 870 && mid <= 990 && ts[i] - ts[i - 1] > gap) { gap = ts[i] - ts[i - 1]; best = mid; }
  }
  return best;
}

function pickCue(w, r) {
  const keys = Object.keys(w).filter((k) => w[k] > 0);
  let x = r() * keys.reduce((s, k) => s + w[k], 0);
  for (const k of keys) if ((x -= w[k]) <= 0) return k;
  return keys.length ? keys[keys.length - 1] : null;
}

// Noise for loops and bursts. A pink loop is cross-faded at its seam so that it does not click.
function noiseBuffer(ctx, seconds, channels, pink, seed) {
  const n = Math.floor(ctx.sampleRate * seconds), m = Math.floor(ctx.sampleRate * 0.1);
  const buf = ctx.createBuffer(channels, n, ctx.sampleRate);
  const rng = mulberry32(seed);
  const x = new Float32Array(n + m);
  for (let c = 0; c < channels; c++) {
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n + m; i++) {
      const w = rng() * 2 - 1;
      if (!pink) { x[i] = w; continue; }
      // Paul Kellet's economy filter: about -3 dB for each octave.
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      x[i] = (b0 + b1 + b2 + w * 0.1848) * 0.25;
    }
    const d = buf.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = i < m ? x[i] * (i / m) + x[n + i] * (1 - i / m) : x[i];
  }
  return buf;
}

// The echo of a narrow lane: two slaps off the near walls, then a short dull tail.
function laneEcho(ctx, seed) {
  const sr = ctx.sampleRate, n = Math.floor(sr * 1.3), buf = ctx.createBuffer(2, n, sr);
  const rng = mulberry32(seed);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      lp += (rng() * 2 - 1 - lp) * 0.35;
      d[i] = lp * Math.exp(-i / sr / 0.22);
    }
    d[Math.floor(sr * (0.019 + c * 0.004))] += 0.9;
    d[Math.floor(sr * (0.043 - c * 0.006))] += 0.5;
  }
  return buf;
}

// Envelope hits on a gain: each [time, peak, decay]. Times must rise.
function hits(param, list) {
  for (const [t, a, tau] of list) {
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(a, t + 0.002);
    param.setTargetAtTime(0, t + 0.002, tau);
  }
}

// ---- the clear sounds: each one is (S, out, t, r) -> end time ----

// One pipe drips a few times at a steady beat.
function drip(S, out, t, r) {
  const n = 2 + Math.floor(r() * 4), beat = 0.5 + r() * 0.9, f0 = 1000 + r() * 700;
  const o = S.osc('sine', f0, S.gain(0, out));
  const g = o.out.gain;
  let ti = t;
  for (let i = 0; i < n; i++, ti += beat * (0.96 + r() * 0.08)) {
    const f = f0 * (0.97 + r() * 0.06);
    o.frequency.setValueAtTime(f, ti);
    o.frequency.exponentialRampToValueAtTime(f * 1.8, ti + 0.04);
    hits(g, [[ti, 0.07 * (0.7 + r() * 0.3), 0.022]]);
  }
  return S.run(o, t, ti + 0.3);
}

// A loom through a wall: the shuttle's light knock, then the beat of the reed.
function loom(S, out, t, r) {
  const dur = 5 + r() * 5, beat = 0.36 + r() * 0.12;
  const wall = S.filter('lowpass', 2200, out);
  const knock = S.gain(0, S.filter('bandpass', 1500 + r() * 600, wall, 1.6));
  const thud = S.osc('sine', 70, S.gain(0, wall));
  const kl = [], tl = [];
  for (let ti = t; ti < t + dur; ti += beat) {
    const a = Math.min(1, (ti - t) / 1.2, (t + dur - ti) / 1.2);
    kl.push([ti, 0.08 * a, 0.012], [ti + beat * 0.42, 0.16 * a, 0.012]);
    tl.push([ti + beat * 0.42, 0.14 * a, 0.05]);
  }
  hits(knock.gain, kl);
  hits(thud.out.gain, tl);
  S.noise(t, dur + 0.3, knock);
  return S.run(thud, t, t + dur + 0.3);
}

// A two-note call, the second note with a little vibrato.
function whistle(S, out, t, r) {
  const g = S.gain(0, out);
  const o = S.osc('sine', 1500, g), f = o.frequency;
  const vib = S.osc('sine', 5.5, S.gain(0, f));
  const lift = 0.94 + r() * 0.12, a = 0.05;
  f.setValueAtTime(1500 * lift, t);
  f.exponentialRampToValueAtTime(2350 * lift, t + 0.3);
  f.setValueAtTime(2300 * lift, t + 0.45);
  f.linearRampToValueAtTime(2420 * lift, t + 0.55);
  f.exponentialRampToValueAtTime(1750 * lift, t + 1.1);
  vib.out.gain.setValueAtTime(0, t + 0.5);
  vib.out.gain.linearRampToValueAtTime(30, t + 0.75);
  const e = g.gain;
  e.setValueAtTime(0, t);
  e.linearRampToValueAtTime(a, t + 0.05);
  e.setValueAtTime(a, t + 0.27);
  e.linearRampToValueAtTime(0, t + 0.33);
  e.setValueAtTime(0, t + 0.45);
  e.linearRampToValueAtTime(a, t + 0.5);
  e.setValueAtTime(a, t + 0.95);
  e.linearRampToValueAtTime(0, t + 1.12);
  // Breath in the whistle.
  S.noise(t, 1.2, S.gain(0.25, S.filter('bandpass', 2100, g, 2)));
  S.run(vib, t, t + 1.2);
  return S.run(o, t, t + 1.2);
}

// Wings: a few birds, each with a short run of claps, and the rush of air under them.
function flutter(S, out, t, r, birds, amp) {
  const claps = S.gain(0, S.filter('bandpass', 1100, out, 0.9));
  const times = [];
  for (let b = 0; b < birds; b++) {
    const t0 = t + r() * 1.4, rate = 7 + r() * 3, n = 5 + Math.floor(r() * 8);
    for (let i = 0; i < n; i++) times.push(t0 + i / rate + (r() - 0.5) * 0.01);
  }
  times.sort((x, y) => x - y);
  const list = [];
  for (const ti of times) {
    if (list.length && ti - list[list.length - 1][0] < 0.004) continue;
    const env = Math.sin(Math.PI * clamp((ti - t) / 2.8, 0, 1));
    list.push([ti, amp * 0.4 * (0.4 + 0.6 * r()) * env, 0.012]);
  }
  hits(claps.gain, list);
  const air = S.gain(0, S.filter('lowpass', 500, out));
  air.gain.setValueAtTime(0, t);
  air.gain.linearRampToValueAtTime(0.08 * amp, t + 0.8);
  air.gain.linearRampToValueAtTime(0, t + 3);
  S.noise(t, 3.1, air);
  return S.noise(t, 3.1, claps);
}

// Chan Kwan Leung calls twice, and the birds come down to feed.
function pigeons(S, out, t, r) {
  whistle(S, out, t, r);
  whistle(S, out, t + 1.5, r);
  return flutter(S, out, t + 3.1, r, 14, 1);
}

// The flock circles, further off.
function flock(S, out, t, r) {
  return flutter(S, S.filter('lowpass', 1800, out), t, r, 9, 0.5);
}

// A shuffle of tiles, then a few tiles put down one by one.
function mahjong(S, out, t, r) {
  const bp = S.filter('bandpass', 3200, out, 2.5);
  const g = S.gain(0, bp);
  const dur = 1.8 + r() * 2.2, list = [];
  let ti = t;
  for (; ti < t + dur; ti += 0.006 + r() * 0.03) {
    const env = Math.min(1, (ti - t) / 0.3, (t + dur - ti) / 0.3);
    list.push([ti, (0.08 + r() * 0.16) * env, 0.005]);
    bp.frequency.setValueAtTime(2600 + r() * 1800, ti);
  }
  ti += 0.6;
  for (let k = 2 + Math.floor(r() * 4); k > 0; k--, ti += 0.5 + r() * 1.2) {
    list.push([ti, 0.3, 0.008]);
    bp.frequency.setValueAtTime(2400 + r() * 600, ti);
  }
  hits(g.gain, list);
  return S.noise(t, ti - t, g);
}

// A rally in a corridor: bat, table, bat, table. Then the ball bounces away.
function pong(S, out, t, r) {
  const o = S.osc('sine', 1600, S.gain(0, out));
  const click = S.gain(0, S.filter('highpass', 2500, out));
  const list = [], cl = [];
  const hit = (ti, f, a, tau) => {
    o.frequency.setValueAtTime(f, ti);
    list.push([ti, a, tau]);
    cl.push([ti, a * 0.6, 0.004]);
  };
  let ti = t;
  for (let n = 4 + Math.floor(r() * 9); n > 0; n--) {
    hit(ti, 1600, 0.12, 0.008);
    ti += 0.3 + r() * 0.08;
    hit(ti, 1100, 0.09, 0.012);
    ti += 0.22 + r() * 0.06;
  }
  for (let gap = 0.32, a = 0.07; gap > 0.04; gap *= 0.72, a *= 0.8) {
    hit(ti, 2200, a, 0.006);
    ti += gap;
  }
  hits(o.out.gain, list);
  hits(click.gain, cl);
  S.noise(t, ti - t + 0.2, click);
  return S.run(o, t, ti + 0.2);
}

// A cleaver on a block, or food into a hot wok, or both.
function cook(S, out, t, r) {
  let ti = t;
  const chop = r() < 0.6;
  if (chop) {
    const lp = S.filter('lowpass', 2600, out);
    const body = S.osc('sine', 180, S.gain(0, lp));
    const edge = S.gain(0, S.filter('bandpass', 2400, lp, 1.2));
    const bl = [], el = [];
    const rate = 4.5 + r() * 2.5;
    for (let n = 6 + Math.floor(r() * 10); n > 0; n--, ti += (1 + (r() - 0.5) * 0.15) / rate) {
      body.frequency.setValueAtTime(190, ti);
      body.frequency.exponentialRampToValueAtTime(115, ti + 0.05);
      bl.push([ti, 0.16, 0.03]);
      el.push([ti, 0.08, 0.006]);
    }
    hits(body.out.gain, bl);
    hits(edge.gain, el);
    S.noise(t, ti - t + 0.2, edge);
    S.run(body, t, ti + 0.2);
    ti += 0.6;
  }
  if (!chop || r() < 0.5) {
    const hiss = S.gain(0, S.filter('highpass', 2500, out));
    const g = hiss.gain, end = ti + 2 + r() * 2;
    g.setValueAtTime(0, ti);
    g.linearRampToValueAtTime(0.05, ti + 0.03);
    g.setTargetAtTime(0.018, ti + 0.03, 0.5);
    g.setValueAtTime(0.018, end - 0.6);
    g.linearRampToValueAtTime(0, end);
    // Spits of oil.
    const spit = S.gain(0, S.filter('bandpass', 3500, out, 3));
    const sl = [];
    for (let ts = ti + 0.05; ts < end - 0.3; ts += 0.02 + r() * 0.12) sl.push([ts, 0.02 + r() * 0.04, 0.004]);
    hits(spit.gain, sl);
    S.noise(ti, end - ti, hiss);
    S.noise(ti, end - ti, spit);
    ti = end;
  }
  return ti;
}

const SYNTH = { drip, loom, pigeons, flock, mahjong, pong, cook };
// How much of each sound goes into the lane echo.
const WET = { drip: 0.6, loom: 0.35, pigeons: 0.15, flock: 0.1, mahjong: 0.4, pong: 0.55, cook: 0.35 };

export class Sound {
  constructor() {
    this.on = false;
    this.ctx = null;
    this.rng = mulberry32(1222);
  }

  // Called from a click or a key, so that the browser lets the sound start.
  toggle() {
    if (typeof AudioContext === 'undefined') return false;
    this.on = !this.on;
    if (this.on) {
      if (!this.ctx) this.build(new AudioContext({ latencyHint: 'playback' }));
      this.sleeping = false;
      this.ctx.resume();
      // Let the bed come up before the first clear sound.
      const now = this.ctx.currentTime;
      this.dripAt = Math.max(this.dripAt, now + 2);
      this.cueAt = Math.max(this.cueAt, now + 6);
    } else if (this.ctx) {
      this.offAt = this.ctx.currentTime;
      this.glide(this.master.gain, 0, this.offAt, 0.15);
    }
    return this.on;
  }

  build(ctx) {
    this.ctx = ctx;
    this.tick = -1;
    this.dripAt = this.cueAt = this.planeAt = 0;
    const out = ctx.createDynamicsCompressor(); // a soft limit over all of it
    out.threshold.value = -20;
    out.ratio.value = 4;
    out.connect(ctx.destination);
    this.master = this.gain(0, out);
    this.dry = this.gain(1, this.master);
    this.echo = ctx.createConvolver();
    this.echo.buffer = laneEcho(ctx, 7);
    this.echo.connect(this.gain(0.5, this.master));
    this.white = noiseBuffer(ctx, 2, 1, false, 11);
    const pink = noiseBuffer(ctx, 5, 2, true, 12);
    const loop = (rate, to) => {
      const s = ctx.createBufferSource();
      s.buffer = pink;
      s.loop = true;
      s.playbackRate.value = rate;
      s.connect(to);
      s.start(0, this.rng() * 5);
      return s;
    };

    // The bed: the murmur of the city, a low rumble from the roads, and the hum of the wires.
    this.murmur = this.gain(0, this.dry);
    this.murmurLp = this.filter('lowpass', 600, this.filter('highpass', 120, this.murmur), 0.5);
    loop(1, this.murmurLp);
    this.rumble = this.gain(0, this.dry);
    loop(0.35, this.filter('lowpass', 140, this.rumble));
    this.hum = this.gain(0.007, this.dry);
    this.osc('sawtooth', 50, this.filter('lowpass', 220, this.hum)).start(); // Hong Kong mains: 50 Hz
    this.osc('sine', 0.11, this.gain(0.003, this.hum.gain)).start();

    // One plane at a time: a roar that opens up as it comes near, and a falling whine.
    this.planePan = ctx.createStereoPanner();
    this.planePan.connect(this.dry);
    this.planeGain = this.gain(0, this.planePan);
    this.planeLp = this.filter('lowpass', 400, this.planeGain, 0.6);
    loop(0.8, this.planeLp);
    this.whine = this.osc('sine', 1800, this.gain(0, this.planePan));
    this.whine.start();

    // A hidden tab stops the frame loop, thus it also stops the sound.
    if (typeof document !== 'undefined')
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.glide(this.master.gain, 0, ctx.currentTime, 0.1);
        this.tick = -1;
      });
  }

  gain(v, to) {
    const g = this.ctx.createGain();
    g.gain.value = v;
    if (to) g.connect(to);
    return g;
  }
  filter(type, f, to, q = 0.7) {
    const b = this.ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    b.connect(to);
    return b;
  }
  // An oscillator; `out` is the node it plays into.
  osc(type, f, to) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.connect(to);
    o.out = to;
    return o;
  }
  noise(t, dur, to) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.white;
    s.loop = true;
    s.connect(to);
    s.start(t, this.rng() * 1.9);
    s.stop(t + dur);
    return t + dur;
  }
  run(src, t0, t1) {
    src.start(t0);
    src.stop(t1);
    return t1;
  }
  // Move a param smoothly to v, but only when v changes, to keep its timeline short.
  glide(param, v, now, tau) {
    if (param.goal !== undefined && Math.abs(param.goal - v) <= Math.abs(v) * 0.01 + 1e-6) return;
    param.goal = v;
    param.setTargetAtTime(v, now, tau);
  }

  // One clear sound, with its own place left to right and its share of the lane echo.
  play(kind, t = this.ctx.currentTime + 0.05) {
    const p = this.ctx.createStereoPanner();
    p.pan.value = (this.rng() * 2 - 1) * 0.7;
    p.connect(this.dry);
    p.connect(this.gain(WET[kind], this.echo));
    return SYNTH[kind](this, p, t, this.rng);
  }

  // Once a frame. day: 0 = Tue 16 Dec … 6 = Mon 22 Dec (冬至); speed: the speed of the clock
  // (1 = real time, 0 = paused); planes: the Planes of planes.js.
  update(day, minute, speed, planes) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    if (!this.on) {
      if (!this.sleeping && now > this.offAt + 0.8) { this.sleeping = true; ctx.suspend(); }
      return;
    }
    if (ctx.state !== 'running' || now - this.tick < 0.1) return; // ten updates a second
    this.tick = now;
    const r = this.rng, play = speed > 0, shots = play && speed <= MAX_SPEED;
    this.glide(this.master.gain, play ? MASTER : 0, now, play ? 0.4 : 0.2);

    const lv = bedLevel(day, minute);
    this.glide(this.murmur.gain, 0.004 + 0.035 * lv, now, 0.5);
    this.glide(this.murmurLp.frequency, 300 + 900 * lv, now, 0.5);
    this.glide(this.rumble.gain, 0.006 + 0.019 * lv, now, 0.5);

    if (planes) this.updatePlane(planes, shots, now);

    // The pigeons come down to feed in the mid-afternoon lull.
    const last = this.last;
    this.last = { day, minute };
    if (shots && planes && last && last.day === day && minute - last.minute < 5) {
      const m = lull(planes.times(day));
      if (last.minute < m && minute >= m) { this.play('pigeons'); this.cueAt = Math.max(this.cueAt, now + 12); }
    }

    if (!shots) {
      this.dripAt = Math.max(this.dripAt, now + 1);
      this.cueAt = Math.max(this.cueAt, now + 3);
      return;
    }
    if (now >= this.dripAt) {
      this.play('drip');
      this.dripAt = now + 6 + r() * 10;
    }
    if (now >= this.cueAt) {
      const k = pickCue(cues(day, minute), r);
      if (k) this.play(k);
      this.cueAt = now + (k ? 18 + r() * 22 : 3);
    }
  }

  // Voice one plane at a time, at most about one a minute.
  updatePlane(planes, shots, now) {
    const act = planes.active || [];
    if (this.plane && !act.includes(this.plane)) this.plane = null;
    const fresh = act.reduce((b, a) => (!b || a.s < b.s ? a : b), null); // the last plane to start
    if (shots && fresh && fresh.s < -900 && !this.plane && now >= this.planeAt) {
      this.plane = fresh;
      this.planeAt = now + 50 + this.rng() * 30;
    }
    let amp = 0;
    if (this.plane && shots) {
      const s = this.plane.s, d = Math.hypot(s, 160);
      amp = (160 / d) * clamp((s + 1500) / 300, 0, 1) * clamp((950 - s) / 400, 0, 1);
      // A falling whine: the Doppler shift of a plane at 75 m/s.
      this.glide(this.whine.frequency, (1800 * 343) / (343 + (75 * s) / d), now, 0.1);
      this.glide(this.planePan.pan, clamp(s / 1200, -0.7, 0.7), now, 0.1);
    }
    this.glide(this.planeGain.gain, 0.1 * amp, now, 0.12);
    this.glide(this.planeLp.frequency, 350 + 1800 * amp, now, 0.12);
    this.glide(this.whine.out.gain, 0.002 * amp * amp, now, 0.12);
  }
}
