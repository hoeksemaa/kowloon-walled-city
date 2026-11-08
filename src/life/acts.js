// What the body of a person does: one activity for each "doing" of the plans (src/life/routines.js,
// data/routines.json) and the kind of the room, in this one place. The figures (figures.js)
// move by it: they sleep and breathe, eat with chopsticks, sew and pack, hammer at a bench,
// stir a wok, carry, sweep, talk, play mahjong, wash, play, pray, do their morning exercise,
// reach up, and write. How each one moves is INFERRED; the doings have their sources in the
// plans.
export const ACT = {
  idle: 0, walk: 1, sleep: 2, rest: 3, eat: 4, hands: 5, bench: 6, cook: 7, carry: 8,
  sweep: 9, talk: 10, mahjong: 11, wash: 12, play: 13, pray: 14, exercise: 15, reach: 16, write: 17,
};
// The activities that sit, and those that stand. The others keep the sitting rule of sim.js.
export const SITS = new Set([ACT.rest, ACT.eat, ACT.hands, ACT.mahjong, ACT.write]);
export const STANDS = new Set([ACT.bench, ACT.cook, ACT.carry, ACT.sweep, ACT.wash, ACT.play, ACT.pray, ACT.exercise, ACT.reach]);
// A walk with a load: water, rubbish, a sack, the goods of a workshop.
export const CARRY = /carrying|taking the rubbish|sack of flour|back to the lorry|delivery trolley|collecting the goods|taking the refuse/i;

// The work of each kind of workshop, when the doing only says "at the workshop".
const WORK = { garment: ACT.hands, plastics: ACT.bench, metal: ACT.bench, foodfac: ACT.hands, works: ACT.bench, storage: ACT.carry, services: ACT.hands };

// The rules in order: the first that fits wins.
const RULES = [
  [/asleep|\bnap\b|a rest\b/i, ACT.sleep],
  [/mahjong|playing cards/i, ACT.mahjong],
  [/incense|prayer|shrine|worship|hymns|to pray/i, ACT.pray],
  [/exercise/i, ACT.exercise],
  [/sweeping|emptying the refuse|housework/i, ACT.sweep],
  [/throwing the rubbish|hanging the washing/i, ACT.reach],
  [/filling the drums|filling the buckets|fetching drinking water|washing|a bath|bathing/i, ACT.wash],
  [CARRY, ACT.carry],
  [/getting ready|up early|home from|home late from the youth|picking up|taking the (?:grand)?children/i, ACT.idle],
  [/cooking|helping her mother cook|preparing the vegetables/i, ACT.cook],
  [/homework|studies|drawing his map|accounts|letter boxes|sorting the City's mail|tutoring|at the office/i, ACT.write],
  [/wrapping|packing|outwork|sewing|knitting|won tun|candies/i, ACT.hands],
  [/seeing patients|dentist's chair|cutting hair|at the dental clinic|^at the clinic|making|setting bones|cashier/i, ACT.hands],
  [/chat|asking|begging|visiting|calling at|welcome|on the beat|minding the shop|running the eating house|minding the herbalist|with the mail/i, ACT.talk],
  [/breakfast|lunch|dinner|supper|meal|tea and|tea house/i, ACT.eat],
  [/playing/i, ACT.play],
  [/television|radio|resting|sitting|at the dentist|seeing the doctor|seeing a doctor|haircut|the evening|at home|minded|minding the grand|home with|in the room|centre|kindergarten|school|park|association|mission/i, ACT.rest],
  [/rush order|at the .*workshop|at work|workbench|family workshop|part-time work/i, -1],
];

// The activity of a doing at a place of category cat (a room use of src/roomUses.js, or none).
export function actOf(doing, cat) {
  const d = doing || '';
  for (const [re, act] of RULES) {
    if (!re.test(d)) continue;
    return act >= 0 ? act : WORK[cat] ?? ACT.bench;
  }
  return ACT.idle;
}
