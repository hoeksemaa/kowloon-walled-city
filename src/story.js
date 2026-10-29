// The story: one ordinary week in the city at its height, Tue 16 to Mon 22 Dec 1986.
// Each beat has a time, a place or a person for the camera, a short narration, and one
// recorded quote with its source. A beat marked `inferred` tells a reasonable inference,
// not a recorded fact (see residents.js and people.js).
import { REAL, VOICES } from './residents.js';

const R = Object.fromEntries(REAL.map((p) => [p.key, p]));
const q = (key, i = 0) => ({ ...R[key].quotes[i], who: R[key].name });
const v = (key, t) => ({ t, who: VOICES[key].who, src: VOICES[key].src, tag: VOICES[key].tag });

export const CHAPTERS = [
  'THE CITY WAKES', 'WATER AND POWER', 'WORK', 'NEIGHBOURS', 'CHILDREN AND ROOFS', 'SUNDAY', '冬至 · WINTER SOLSTICE',
];

// day: 0 = Tue 16 Dec 1986 … 6 = Mon 22 Dec (冬至). t: "HH:MM".
export const BEATS = [
  // ---- Tue 16 Dec: the city wakes ----
  { day: 0, t: '04:35', focus: { person: 'ping' }, follow: true,
    text: '林羅平 opens his fishball shop before dawn. He is 27. In 1983 he started this wholesale business with HK$6,000.',
    cite: 'HK01, 20 Jul 2024', quote: q('ping', 3) },
  { day: 0, t: '06:00', focus: { street: 'lys' }, wires: true, cut: 3,
    text: 'Water comes to the low floors. The city has no mains of its own. A private supplier pumps it through these pipes, floor by floor.',
    quote: q('ping', 1) },
  { day: 0, t: '07:20', focus: { view: 'city' },
    text: 'The children leave the city for school.',
    quote: v('officer', 'Kids going to school always emerged from the place in their pristine white uniforms') },
  { day: 0, t: '08:35', focus: { person: 'postman' }, follow: true,
    text: 'Lam Po-chun starts his round. He delivers the mail here, 8 hours a day, from 1979 to 1991.',
    cite: 'WSJ, 2014', quote: { t: 'Buildings: 350 (estimate). Buildings with elevators: 2.', who: 'Lam Po-chun (fact box)', src: 'WSJ, 2014', tag: 'retrospective (2014)' } },
  { day: 0, t: '10:00', focus: { street: 'ttt' },
    text: 'The dentists on Tung Tau Tsuen Road open. In 1983 the Kai Fong Association counted 97 dentists in the city. Many have no Hong Kong licence.',
    cite: 'Kai Fong count, 1983 (WSJ chart)', quote: v('akers', 'the streets were lined with illegal dentists, right in the open.') },
  { day: 0, t: '13:05', focus: { view: 'plane' }, plane: true,
    text: 'An airliner comes in low past the roofs to land at Kai Tak. Across the road, the tailor stops talking until it passes.',
    quote: v('tailor', '一有飛機飛過，就好大聲，講嘢會聽唔到，所以我哋都會等飛機走咗先再講嘢 [when a plane flew over, it was so loud that nobody heard us, so we waited for it to pass]') },
  { day: 0, t: '19:35', focus: { person: 'chan' }, follow: true,
    text: 'Chan Cheung-chuen walks the lanes with his drawing. He is mapping the city by hand. He will finish in March 1987.',
    cite: 'WSJ, 2014', quote: q('chan') },
  { day: 0, t: '22:00', focus: { view: 'city' },
    text: 'Tungsten bulbs light the flats, and fluorescent tubes light the corridors. In the lanes, night and day look much the same.',
    cite: 'Girard, HK01 2024 (narration)', quote: v('officer', 'Night and day within the Walled City were the same, with buzzing electrical wires, dripping pipes') },

  // ---- Wed 17 Dec: water and power ----
  { day: 1, t: '06:05', focus: { street: 'kms' }, wires: true, cut: 3,
    text: 'Two private suppliers run the city’s utilities: one for power, one for water.',
    quote: q('ping', 0) },
  { day: 1, t: '08:00', focus: { street: 'tcs' }, wires: true, cut: 4,
    text: 'At 8 the water moves up to the third and fourth floors. Most of it comes from wells that the residents dug themselves.',
    quote: v('jones', 'The water was largely derived from about 70 or so wells, which the inhabitants of the Walled City had sunk… The actual quality of the water was pretty appalling.') },
  { day: 1, t: '11:00', focus: { standpipe: 0 },
    text: 'For drinking and cooking, people carry buckets from the government standpipes. These stand only on the outer roads, Tung Tau Tsuen Road and Tung Tsing Road.',
    cite: '葉德偉, HK01 2016 (narration)', quote: v('lcf', 'We had to go to a nearby public tap to draw buckets of water for drinking and cooking') },
  { day: 1, t: '15:00', focus: { street: 'lsr' }, wires: true, cut: 5,
    text: 'Most flats have a power-company meter. The kaifong association asked the company for them. Other households pay a man to tap a line.',
    cite: 'HK01, 2016 (narration)', quote: v('pw', 'We had to pay somebody to ‘steal’ electricity for us.') },
  { day: 1, t: '17:30', focus: { street: 'skg' }, wires: true, cut: 4,
    text: 'Nobody mends a broken pipe. They connect a new one beside it. Aerial leads, phone lines and plastic water pipes fill the lanes.',
    quote: v('hk01', '只會再駁一條新的 [they just connected a new one]') },
  { day: 1, t: '20:00', focus: { person: 'ping' },
    text: 'Water is not free. Each month a home pays the water supplier HK$100, and a workshop HK$300.',
    quote: q('ping', 2) },
  { day: 1, t: '23:30', focus: { view: 'city' },
    text: 'The water does not keep to a timetable. When it comes at night, the family gets up to work.',
    quote: v('tam', 'No matter what time it was, even while we were sleeping at night, when we heard the sound of water dripping, we would immediately wake up and do the housework such as laundry and washing the dishes.') },

  // ---- Thu 18 Dec: work ----
  { day: 2, t: '05:50', focus: { view: 'city' }, cut: 0,
    text: 'The workshops start early. In 1983 the Kai Fong Association counted 645 shops, workshops and clinics: plastics, metal, garments, meat, cakes, textiles.',
    cite: 'Kai Fong count, 1983 (WSJ chart)', quote: v('hk01', '士多、織布廠、五金廠、食品廠、膠花廠 [stores, weaving mills, metal works, food factories, plastic-flower works]') },
  { day: 2, t: '09:00', focus: { view: 'city' }, cut: 2,
    text: 'Work is not only at street level. Shops and workshops fill the upper floors too.',
    quote: v('lambot', '因為居民不想為了買包煙都要走到地下 [because residents did not want to walk down to the ground just to buy cigarettes]') },
  { day: 2, t: '11:00', focus: { person: 'ping' }, follow: true,
    text: 'The fishballs leave the city for markets and restaurants in other districts.',
    cite: 'HK01, 2024', quote: q('yip', 1) },
  { day: 2, t: '16:00', focus: { street: 'lys' },
    text: 'The city has no rush hour. People work, shop and live in the same few buildings.',
    quote: v('lambot', '裏面不會出現『繁忙時間』 [there is no ‘rush hour’ inside]') },
  { day: 2, t: '19:20', focus: { person: 'ping' }, follow: true, inferred: true,
    text: 'After work 林羅平 plays mahjong with other bosses. Some of them look down on him because he is young. The source does not give the day.',
    cite: 'HK01, 2024 (narration)', quote: null },
  { day: 2, t: '21:00', focus: { view: 'city' },
    text: 'Nobody here needs a building permit. A builder agrees each new floor with the neighbours.',
    quote: v('hauLin', 'You didn’t need any paperwork from the government for construction, so you had to collaborate with your neighbors yourself. Oh, and also be aware of the building height limits.') },

  // ---- Fri 19 Dec: neighbours ----
  { day: 3, t: '07:30', focus: { view: 'city' },
    text: 'Some flats stand so close that two households can not open their windows at the same time. A neighbour lends soy sauce across the gap.',
    cite: 'HK01, 2016 (narration)', quote: v('hk01', '手一伸，便可向鄰居借鼓油 [reach out a hand, and borrow soy sauce from a neighbour]') },
  { day: 3, t: '10:00', focus: { view: 'city' },
    text: 'The kaifong (街坊, neighbours) watch out for each other. The store downstairs offers to carry an old man’s shopping up the stairs.',
    cite: 'SCMP, 2018', quote: v('lcf', 'The kaifong were very close') },
  { day: 3, t: '12:00', focus: { building: 'kaifong' },
    text: 'The Kai Fong Welfare Association stamps the paper when a flat changes hands. Its office is on 2/F and 3/F, 16 Tung Tau Tsuen Road.',
    cite: 'HK01, 2016; GRS HKRS1255-3-577A (address at the clearance)', quote: q('lau', 0) },
  { day: 3, t: '15:00', focus: { person: 'laut' }, follow: true,
    text: 'Outside the city, the papers call it lawless. 劉太 tells it differently.',
    quote: q('laut', 0) },
  { day: 3, t: '19:00', focus: { person: 'cheungchuen' }, follow: true,
    text: '陳祥全 comes home. In 1979 he and his wife left a partitioned room outside. Here about HK$800 a month gives them a whole flat.',
    cite: 'HK01, 2016 (narration)', quote: q('cheungchuen', 0) },
  { day: 3, t: '21:00', focus: { person: 'yip' },
    text: '葉德偉 bought his flat in 1976 for HK$30,000, half the price outside. He works as an accountant in Central.',
    cite: 'SCMP, 2013', quote: q('yip', 0) },

  // ---- Sat 20 Dec: children and roofs ----
  { day: 4, t: '07:35', focus: { view: 'city' }, inferred: true,
    text: 'Saturday. The children go to school in the morning only.',
    quote: null },
  { day: 4, t: '14:35', focus: { person: 'albert' }, follow: true,
    text: 'Albert Ng Kam-po is 18. His family of five lives in Room A, 7/F, 8 Sz Kung Street. On the roofs, children run from building to building.',
    cite: 'WSJ, 2014', quote: q('albert', 0) },
  { day: 4, t: '15:30', focus: { view: 'plane' }, plane: true,
    text: 'From the roofs, the airliners pass low overhead. Children fly kites from the roofs, up toward the airliners.',
    cite: 'SCMP, 2013 (narration)', quote: v('officer', 'I occasionally went to the roofs to watch the planes skim over the top and land at Kai Tak') },
  { day: 4, t: '16:30', focus: { view: 'city' },
    text: 'The Salvation Army runs a kindergarten in the city.',
    cite: 'WSJ narration, 2014', quote: v('pw', 'Many children went to school there. We played together and sang songs. It was very happy.') },
  { day: 4, t: '19:35', focus: { person: 'albert' }, follow: true, cut: 7, inferred: true,
    text: 'In the evening the corridors become a games room.',
    quote: q('albert', 1) },

  // ---- Sun 21 Dec: Sunday ----
  { day: 5, t: '08:30', focus: { view: 'city' }, inferred: true,
    text: 'Sunday. Most workshops are shut and the lanes are quiet. Many families go out of the city for the day.',
    quote: null },
  { day: 5, t: '10:00', focus: { person: 'fan' }, follow: true,
    text: '芬姐 minds her family’s store. She grew up in the city, and she met her sweetheart here.',
    cite: 'HK01, 2016 (narration)', quote: q('fan', 0) },
  { day: 5, t: '11:30', focus: { building: 'temple' },
    text: 'The Fuk Tak shrine stands in the 5th lane of Tai Chang Street. It is popular with Chiu Chow residents.',
    cite: 'GRS HKRS1255-3; WSJ narration, 2014', quote: null },
  { day: 5, t: '14:30', focus: { building: 'yamen' },
    text: 'The Yamen is the one Qing-era building left in the city. A church runs an old people’s centre in it.',
    cite: 'WSJ narration, 2014', quote: null },
  { day: 5, t: '15:00', focus: { person: 'chan' }, follow: true,
    text: 'On Sunday Chan Cheung-chuen has the whole day for his map. Every lane goes into it.',
    cite: 'WSJ, 2014', quote: q('chan') },
  { day: 5, t: '20:00', focus: { person: 'lau' }, follow: true,
    text: '劉先生 came to the city in 1949, at 6. He lived first in a tin hut. Now his family lives on 6/F, above a rattan shop.',
    cite: 'HK01, 2016', quote: q('lau', 1) },

  // ---- Mon 22 Dec: 冬至 ----
  { day: 6, t: '06:30', focus: { view: 'city' }, inferred: true,
    text: 'Monday 22 December 1986 is 冬至, the winter solstice. Across Hong Kong, families eat together tonight: “冬大過年”, the winter festival is bigger than New Year.',
    cite: 'Hong Kong custom; inferred for the city', quote: null },
  { day: 6, t: '14:30', focus: { person: 'laut' }, follow: true, inferred: true,
    text: '劉太 goes out to buy food for the 冬至 dinner.',
    quote: q('laut', 1) },
  { day: 6, t: '17:30', focus: { view: 'city' }, inferred: true,
    text: 'Workers come home early. The workshops shut, and the shops close their shutters.',
    quote: null },
  { day: 6, t: '18:40', focus: { view: 'night' }, inferred: true,
    text: 'Thirty-three thousand people sit down to dinner. The windows are lit.',
    quote: q('cheungchuen', 0) },
  { day: 6, t: '22:30', focus: { view: 'city' },
    text: 'One ordinary week in the city, at its height.',
    quote: v('lamYM', 'This is my home … It was a good place to live.') },
];

for (const b of BEATS) {
  const [h, m] = b.t.split(':').map(Number);
  b.minute = h * 60 + m;
  b.key = b.day * 1440 + b.minute;
}
BEATS.sort((a, b) => a.key - b.key);

// The beat in force at a given day of the week and minute.
export function beatAt(day, minute) {
  const k = day * 1440 + minute;
  let cur = -1;
  for (let i = 0; i < BEATS.length; i++) if (BEATS[i].key <= k) cur = i;
  return cur;
}
