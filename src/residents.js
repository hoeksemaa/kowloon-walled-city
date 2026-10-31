// Real residents and workers who were in the city in December 1986, from their own
// testimony. Each one says only words that a source records. A fact in a "narration" line
// is the reporter's account of what the person said. Their hour-by-hour week is INFERRED
// from their trade and the facts below; each schedule says so in the app.
//
// Quotes in Chinese keep the original words; the bracketed English is a gloss.

export const REAL = [
  {
    key: 'chan',
    name: 'Chan Cheung-chuen',
    role: 'engineering student who drew a map of the city',
    age: null,
    home: { street: 'ttt', num: 31, floor: 12, unit: 'B', text: '12/F, Room B, 31 Tung Tau Tsuen Road', size: '200–300 sq ft (WSJ, 2014)' },
    sched: 'mapper',
    household: 3,
    facts: [
      ['In the city 1985–1991. A flat of 200–300 sq ft for 3 people; rent HK$800–900 a month (1985–88).', 'WSJ, 2014 (fact box)'],
      ['He drew the lanes by hand. The map took four months and he finished it in March 1987, thus this week he is drawing it.', 'WSJ narration, 2014'],
      ['Neighbours swapped soy sauce through the windows, and raised the alarm for fires.', 'M+ audio guide (his account)'],
    ],
    quotes: [
      { t: 'the intertwined streets, and the upper-level walkways connecting different buildings', src: 'M+ audio guide 8038', tag: 'retrospective (after 2021)' },
    ],
  },
  {
    key: 'albert',
    name: 'Albert Ng Kam-po',
    role: 'son of a Chiu Chow family, 18',
    age: 18,
    home: { street: 'skg', num: 8, floor: 7, unit: 'A', text: 'Room A, 7/F, 8 Sz Kung Street', size: 'more than 200 sq ft (WSJ, 2014)' },
    sched: 'youth',
    household: 5,
    facts: [
      ['In the city 1975 to 1991 or 1992. His family bought the flat, more than 200 sq ft, in 1975 for about HK$50,000.', 'WSJ, 2014 (fact box)'],
      ['He was 45 and a pastor in 2013, thus about 18 in December 1986.', 'SCMP, 4 Jan 2013'],
    ],
    quotes: [
      { t: 'We would just play ping pong in the hallway … The kids would go onto the roofs and leap from building to building, or we would drag discarded mattresses to the roof and jump on them. It was a happy time.', src: 'SCMP, 4 Jan 2013', tag: 'retrospective (2013)' },
      { t: 'We didn’t know it was so dangerous', src: 'SCMP, 4 Jan 2013', tag: 'retrospective (2013)' },
    ],
  },
  {
    key: 'ping',
    name: '林羅平 (平哥)',
    role: 'fishball wholesaler, 27',
    age: 27,
    work: { near: 'edge', use: 'foodfac', text: 'his wholesale shop, near the outer street (place approximate)' },
    sched: 'fishball',
    facts: [
      ['At 24, in 1983, he opened his own wholesale shop in the city with HK$6,000. The landlord came from his home town and asked a low rent.', 'HK01, 20 Jul 2024 (narration)'],
      ['His shop was near the outer street, thus it had a power-company meter.', 'HK01, 2024 (narration)'],
      ['After work he once played mahjong with other bosses. Some looked down on him because he was young.', 'HK01, 2024 (narration)'],
      ['Other fishball makers came to "飲茶" [have tea] with him to learn his methods.', 'HK01, 2024 (narration)'],
    ],
    quotes: [
      { t: '城寨內有兩戶業主，一人專門供電，另一人專門供水 [two owners in the city: one supplied the power, the other the water]', src: 'HK01, 20 Jul 2024', tag: 'retrospective (2024)' },
      { t: '二、三樓可能於早上6、7點來水，然後8、9時就輪到三、四樓 [2/F and 3/F got water at about 6 or 7 a.m., then 3/F and 4/F at 8 or 9]', src: 'HK01, 20 Jul 2024', tag: 'retrospective (2024)' },
      { t: '住宅用戶每月繳交100元，開工場則每個月支付300元水費 [a home paid HK$100 a month for water, a workshop HK$300]', src: 'HK01, 20 Jul 2024', tag: 'retrospective (2024)' },
      { t: '九龍城寨有好多老鼠，好多潮州人講潮州話㗎嘛 [the city had a lot of rats, and a lot of Chiu Chow people speaking Chiu Chow]', src: 'HK01, 20 Jul 2024', tag: 'retrospective (2024)' },
    ],
  },
  {
    key: 'postman',
    name: 'Lam Po-chun',
    role: 'postman for the city',
    age: null,
    sched: 'postman',
    look: { hat: 3 }, // a navy hat against "the constant dripping" (City of Darkness Revisited, pp148-149)
    facts: [
      ['He delivered the mail inside the city from 1979 to 1991, on an 8-hour shift.', 'WSJ, 2014 (fact box)'],
      ['His count: about 350 buildings, and 2 with lifts.', 'WSJ, 2014 (fact box)'],
      ['"郵差和送貨員是例外" [postmen and delivery men were the exception]: the people who went everywhere in the city.', 'Greg Girard, HK01 2024 (interview 2019)'],
      ['He "had a small moustache and was nicknamed by the locals \'hu xu zi\' (beardie), or postman Ah-Po".', 'City of Darkness Revisited, p146'],
      ['He climbed one stair, crossed the roofs by ladders and windows, and went down another.', 'City of Darkness Revisited, pp145–146'],
    ],
    quotes: [],
  },
  {
    key: 'yip',
    name: '葉德偉 Yip Tak-wai',
    role: 'accountant in Central, 30',
    age: 30,
    home: { floor: 4, text: 'a flat of 400 sq ft (building not recorded; place inferred)', size: '400 sq ft (SCMP, 2013)' },
    sched: 'commuter',
    facts: [
      ['He bought a 400 sq ft flat in the city in 1976 for HK$30,000, half the price outside.', 'SCMP, 4 Jan 2013'],
      ['He worked as an accountant in an office in Central.', 'SCMP, 2013; HK01, 2016'],
      ['Later he led the former residents’ association.', 'WSJ, 2014; HK01, 2016'],
    ],
    quotes: [
      { t: 'Even though it seemed like the Walled City was an ungoverned place, it was actually a self-governing community.', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
      { t: 'You know the fishballs that Kowloon City is famous for? They would be made in the walled city and sold outside.', src: 'SCMP, 4 Jan 2013', tag: 'retrospective (2013)' },
      { t: '城寨倒是多文膽，人人寫得一手好書法，寨內亦有幾個辦學團體 [many scholars in the city, everyone wrote a fine hand, and there were several school bodies]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
    ],
  },
  {
    key: 'cheungchuen',
    name: '陳祥全',
    role: 'tenant, with his wife',
    age: null,
    home: { floor: 5, text: 'a whole flat for about HK$800 a month (building not recorded; place inferred)' },
    sched: 'tenant',
    facts: [
      ['In 1979 he and his wife left a partitioned room (板間房) in Kowloon City. In the city about HK$800 a month gave them a whole flat.', 'HK01, 2016 (narration)'],
    ],
    quotes: [
      { t: '都叫做有一個自己的空間。 [at least it was a space of our own]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
      { t: '不用懂武功，你跳下去都會被卡住。 [no kung fu needed: jump down between the buildings and you get stuck]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
    ],
  },
  {
    key: 'lau',
    name: '劉先生 Mr Lau',
    role: 'resident since 1949, 43',
    age: 43,
    home: { floor: 6, text: '6/F, above a rattan shop (building not recorded; place inferred)', pair: 'laut' },
    sched: 'worker',
    facts: [
      ['He came to the city at 6, and lived first in a tin hut. A developer bought the hut for a high-rise, and he got a flat in the new building.', 'HK01, 2016 (narration)'],
      ['He paid no rates and no land tax. A sale was a sheet of paper, signed by both and stamped by the kaifong association.', 'HK01, 2016 (narration)'],
    ],
    quotes: [
      { t: '手上僅一張沙紙而已，大家講個『信』字 [only a sheet of paper in hand; everyone relied on trust]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
      { t: '把你丟進海中，你都要拼命游。 [throw you into the sea, and you swim for your life]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
    ],
  },
  {
    key: 'laut',
    name: '劉太 Mrs Lau',
    role: 'homemaker; her children are grown',
    age: null,
    sched: 'market',
    facts: [
      ['At first she was not used to the city and often got lost.', 'HK01, 2016 (photo caption)'],
      ['On 14 Jan 1987 she came back from the market and saw the crowd.', 'HK01, 2016 (narration)'],
    ],
    quotes: [
      { t: '他們不會無故打擾你，其實是很安穩、很安全。 [they did not bother you for no reason; it was very stable, very safe]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
      { t: '無野可以俾你驚 [nothing there can scare you]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
    ],
  },
  {
    key: 'fan',
    name: '芬姐',
    role: 'grew up in the city; minds the family store',
    age: null,
    work: { near: 'inner', use: 'shop', text: 'the family store (place inferred)' },
    home: { floor: 2, text: 'with her family (building not recorded; place inferred)' },
    sched: 'store',
    facts: [
      ['While her mother went to carry water, she minded the store alone, and young men came to buy. She met her sweetheart in the city.', 'HK01, 2016 (narration)'],
      ['On 14 Jan 1987 she sat in a hair salon inside the city, having a perm "準備過節" [to get ready for the festival].', 'HK01, 2016'],
    ],
    quotes: [
      { t: '其實我們不會覺得有問題，生於此已經習慣。 [we did not see a problem; born here, we were used to it]', src: 'HK01, 2016', tag: 'retrospective (2016)' },
    ],
  },
];

// Other first-hand words the story uses (not followable people).
export const VOICES = {
  officer: { who: 'a police officer posted to Kowloon City in 1987', src: 'SCMP, 23 Mar 2018', tag: 'retrospective (2018)' },
  tailor: { who: '林財銳, tailor on 城南道, across the road', src: 'HK01, 10 Nov 2016', tag: 'retrospective (2016)' },
  jones: { who: 'Gordon Jones, Kowloon City District Officer', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  tam: { who: 'Tam Sau-kuen 谭秀娟, housewife', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  pw: { who: 'Wong Chan Pui-wah 黄陈佩华, garment-factory worker', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  lambot: { who: 'Ian Lambot, photographer, 1987–92', src: 'HK01, 8 May 2024 (interview 2019)', tag: 'retrospective (2019)' },
  girard: { who: 'Greg Girard, photographer, 1987–92', src: 'HK01, 8 May 2024 (interview 2019)', tag: 'retrospective (2019)' },
  akers: { who: 'Sir David Akers-Jones, government official', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  lcf: { who: 'Lau Chun-fat, toy-factory worker', src: 'SCMP, 23 Mar 2018', tag: 'retrospective (2018)' },
  hauLin: { who: 'Chan Hau-lin 陈厚练, building developer', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  kamChiu: { who: 'Lau Kam-chiu 刘锦朝, electrician', src: 'WSJ, 2014', tag: 'retrospective (2014)' },
  lamYM: { who: 'Lam Yin Ming, resident', src: 'Baltimore Sun, 30 Jun 1992', tag: 'at the time (1992)' },
  hk01: { who: 'HK01 reporters, from five residents', src: 'HK01, 26–28 Aug 2016', tag: 'narration (2016)' },
};

// People of City of Darkness Revisited (2014) at their places, by their number on the book's
// 1992 map (data/book.json). Only people whose dates, or a clearance file of 1987-92, put
// them in the city in 1986. They say no words in the model: their facts and hours come from
// the book, which met them in about 1990, thus the hours are APPROXIMATE for 1986. trade: the
// trade key of the clearance files (layout.js). home: where they lived, if the book says;
// else the model puts a flat near the work (INFERRED).
// look: the clothes in the book's photo of them (about 1990), sRGB; hat 2 is a flat cap.
//
// open: the hours of each day, [from, to] in hours. days: 7 every day, 6 Monday to
// Saturday. sun: other hours on Sunday. page: the page that gives the hours; without it the
// hours are INFERRED from the trade. On 冬至 every place shuts at 18:00 (INFERRED).
export const BOOK_PEOPLE = [
  { n: 1, sched: 'pigeons', roof: true, doing: 'with the pigeons on his rented roof', look: { top: '#1f1d1d', bottom: '#3c5a80' } }, // black polo, jeans (p321)
  { n: 2, trade: 'factory', open: [[8, 19]], days: 6, doing: 'making golf balls' },
  { n: 3, trade: 'medicine', open: [[8, 23]], days: 7, page: 82, doing: 'at the herbal store', hours: '“officially we are open from 8am to 11pm”' },
  { n: 4, trade: 'noodles', open: [[8, 17]], days: 6, page: 228, doing: 'making noodles', hours: 'from 8am, about nine hours' },
  { n: 8, trade: 'factory', open: [[8, 19]], days: 6, doing: 'making wooden rulers' },
  { n: 11, trade: 'cafe', open: [[9, 23.5]], days: 7, page: 57, doing: 'running the café', hours: 'from 9am to very late at night' },
  { n: 14, trade: 'noodles', open: [[6.5, 17.5]], days: 6, doing: 'making noodles', home: { above: true, text: 'the family flat above the factory (p170)' },
    look: { top: '#c9b79c', bottom: '#5a5754', hat: 2 } }, // a beige sweater and a grey flat cap dusted with flour (p171)
  { n: 20, trade: 'store', open: [[7.5, 22]], days: 7, doing: 'minding the grocery' },
  { n: 21, trade: 'textile', open: [[8, 19]], days: 6, doing: 'at the looms' },
  { n: 24, trade: 'store', open: [[8, 24]], days: 7, page: 93, doing: 'minding the store', busy: [17, 21], hours: '8am to midnight, busiest from 5 to 9pm' },
  { n: 25, trade: 'cakes', open: [[7, 21]], days: 6, page: 76, doing: 'making candy', late: [18, 'the wrapping goes on to 9pm'], hours: '7am to 6pm; the wrapping goes on to 9pm' },
  { n: 32, trade: 'plastics', open: [[8, 18]], days: 6, rush: [1, 3], doing: 'making rubber plungers', hours: 'in a rush, also after dinner to 2 or 3am (p237)' },
  { n: 33, trade: 'clinic', open: [[9, 13], [15.5, 20]], sun: [[9, 13]], days: 6, page: 187, doing: 'seeing patients', hours: '9 to 1 and 3.30 to 8, Monday to Saturday; Sunday morning' },
  { n: 35, trade: 'bonesetter', open: [[9, 19]], days: 6, doing: 'setting bones' },
  { n: 36, trade: 'dentist', open: [[10, 19]], days: 6, doing: 'at the dentist’s chair' },
  { n: 39, trade: 'roastmeat', open: [[4, 6.25], [8, 14]], days: 7, page: 286, doing: 'roasting meat', between: 'selling at the market', hours: 'from 4am; at the market 6.15 to 8am' },
];
