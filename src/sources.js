// Shown in the "Sources + notes" panel. Each item says what the model takes from a source,
// and what it infers. Full notes and quotes: primary-sources/ (one folder per source).
const A = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const GH = (dir, text) => A(`https://github.com/hoeksemaa/kowloon-walled-city/tree/main/primary-sources/${dir}`, text);
const PLAN = A('https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg', 'the 1980s street plan');
const GRS = GH('grs-catalogue-kwc', 'GRS HKRS1255-3');
const MPLUS = GH('mplus-girard-lambot-photos', 'Girard and Lambot, M+');
const HO = GH('mplus-suenn-ho-ca17', 'Suenn Ho, M+ CA17');
const HANSARD = GH('legco-hansard-1986-1993', 'LegCo Hansard');
const WSJ = GH('wsj-kwc-2014', 'WSJ 2014');
const HK01 = GH('hk01-kaifong-series-2016', 'HK01 2016');
const WEB = GH('retrospective-testimony-web', 'HK01 2024, SCMP 2013 and 2018, M+ audio guide');
const LCSD = A('https://www.lcsd.gov.hk/en/parks/kwcp/historical.html', 'LCSD');
const ZHWP = A('https://zh.wikipedia.org/wiki/九龍寨城', 'ZH Wikipedia');
const BOOK = GH('city-of-darkness-revisited', 'City of Darkness Revisited (2014)');
const CSDI = A('https://portal.csdi.gov.hk', 'the CSDI Portal');

// A person of the 1992 map: the number, the name, the trade, the page, the words of the key
// where they differ, and the address (data/book.json).
const mapPerson = (p) => {
  const refs = [p.page && `p${p.page}`, p.key && p.key.toLowerCase() !== p.what.toLowerCase() && `key: “${p.key}”`].filter(Boolean);
  return `<li><span class="st ok">NO. ${p.n}</span>${p.name}, ${p.what}${refs.length ? ` (${refs.join('; ')})` : ''}${p.where ? `: ${p.where}` : ''}.`
    + `${p.conflict ? ` ${p.conflict}` : ''}${p.note ? ` ${p.note}` : ''}</li>`;
};

// others: the people of the 1992 map who are not in the model.
export const sourcesHtml = (others) => `
<p>One ordinary week in the city at its height: Tuesday 16 to Monday 22 December 1986, the
day of 冬至 (the winter solstice). Nine real people have the mark REAL PERSON. Point at one of
them to see their facts and one recorded quote, with the source of each. Sixteen more people
of City of Darkness Revisited work at their places and say no words. Every other person is a
composite. A detail that no source records is marked inferred.</p>

<h4>From primary sources</h4>
<ul>
  <li><span class="st ok">PLAN</span>Lanes, 474 plots, the Yamen compound, factory sites and named buildings
    are traced from ${PLAN}, on display in Kowloon Walled City Park (photo by Lord Jaraxxus,
    CC BY-SA 4.0). The traced grid in <code>data/plan.json</code> is CC BY-SA 4.0 too. The model draws
    each plot as a polygon with straight walls, not as grid steps.</li>
  <li><span class="st ok">SHOPS</span>459 premises with street, house number, floor, name and trade, from the
    titles of the clearance files of 1987–92 (${GRS}). The signs carry these names.</li>
  <li><span class="st ok">TRADES</span>The Kai Fong Association started on 1 May 1963 (${BOOK}, p178). In 1983 it
    counted 645 shops, workshops and clinics, 97 of them dentists (charted in ${WSJ}).</li>
  <li><span class="st ok">BOOK</span>${BOOK}, by Greg Girard and Ian Lambot: the street names Tai Chang St,
    Almshouse Back St, Tin Hau Temple St and Lung Chun Back Rd, and the 40 numbers of its 1992 map
    (pp352–353). Twelve numbers mark a place. The label tool (key M) shows them on the buildings, with the
    street names. The other numbers name people. Point at a person of the book to see their number. A list below gives the people of the map
    that the model does not show. The book counts "some 300 individual buildings", "28,200
    occupants" and "8800 separate apartments" in January 1987 (p340). The map and the 1987 figure-ground plan
    (p134) are fitted to the traced plan by <code>tools/book_overlay.py</code>. The 1987 plan joins the 474
    plots into 286 towers. The fit is approximate: the masks overlap by 73%. Thus a check by eye compared the
    plots with the plan, and that check changed 27 towers. Only numbers go into <code>data/</code>; no image
    from the book is in the app.</li>
  <li><span class="st ok">STAIRS</span>Suenn Ho's stair types (${BOOK}, pp138–139): a stair in the centre or at the
    side, a corridor with a stair at each end, and stairs that two or three buildings share.</li>
  <li><span class="st ok">LINKS</span>"the upper-level walkways connecting different buildings" (Chan Cheung-chuen, M+ audio
    guide); the postmen climbed one stair, crossed the roofs by ladders and windows, and went down another (${BOOK},
    pp145–146); "The kids would go onto the roofs and leap from building to building" (Albert Ng, SCMP 2013).</li>
  <li><span class="st ok">FLATS</span>Two floors that the clearance survey drew in 1987 (p340): the 4/F flat of
    6 Sai Shing Road, measured on 9 Nov 1987, and a 5/F of 3 Cheung On Lane where three stairs meet. The
    model draws the rooms of the first and gives the units of the second their survey addresses. It places
    both by house number.</li>
  <li><span class="st ok">HEIGHT</span>Storeys along the south face, read off Lambot's south elevation of 1990
    (${MPLUS}, 2017.412). On Tung Tau Tsuen Road, "12 storeys and more" from 1972 (p132), and one
    building of 14 storeys from 1975 (p336).</li>
  <li><span class="st ok">NUMBERS</span>House numbers fall from west to east on Tung Tau Tsuen Road and Lung Chun
    Road, and from north to south on Sai Shing Road (Suenn Ho's route map, ${HO}).</li>
  <li><span class="st ok">PEOPLE</span>"28,200 occupants residing in 8800 separate apartments" in January 1987
    (${BOOK}, p340). The same count gives "just over 33,000" with the people who worked in the City but lived
    elsewhere (p339). Thus the model has 28,200 residents, and 4,800 workers who come in each morning and go
    home at night. About 10,000 families (written answer, 18 Feb 1987) and 33,000 residents (the Governor,
    12 Oct 1988) are in ${HANSARD}.</li>
  <li><span class="st ok">BOOK PEOPLE</span>Sixteen people of ${BOOK}, at their places: the pigeon breeder Chan Kwan
    Leung on his roof (pp318–321), the doctor Tsin Mu Lam on 2/F of 10 Tung Tau Tsuen Road (p184), the noodle
    maker Hui Tung Choy above his factory (p170), the herbal doctor Chan Pui Yin (p82), the candy maker Lee Yu
    Chun (p76), the storekeeper Lee Pui Yuen at 12 Tai Chang Street (p93), the roast-meat maker Yim Kwok Yuen on
    Lo Yan Street (p286), and others. A small gold marker floats over each real person. The hours that the book gives
    are in their week (pp57, 76, 82, 93, 187, 228, 237, 286). The book met them in about 1990, and they say no
    words in the model.</li>
  <li><span class="st ok">POSTMAN</span>Lam Po Chun, "hu xu zi" (beardie) to the locals, sorted the mail at the Lung
    Kong Road Post Office. His round started at a store on Lo Yan Street. He worked one north–south lane, then the
    side alleys; he climbed one stair, crossed the roofs by ladders and windows, and went down another. He filled
    the postbox walls, met some residents at 4/F or 5/F and delivered outside the City for part of the day
    (${BOOK}, pp145–146). He was a postman in the City "From 1979 to 1989" (p145), or from 1979 to 1991 on an
    8-hour shift (WSJ, 2014); both include 1986. A hat was "standard issue against the constant dripping in the
    alleyways" (p149). The navy hat and the canvas bag in the model are those of postman Lui Man Sang in the
    book's photos (pp144, 148): the model has one postman only.</li>
  <li><span class="st ok">FIND THEM</span>The game 尋人 has three cases: the postman, the pigeon breeder and the noodle
    maker. Each Who and How hint quotes ${BOOK}, with its page.</li>
  <li><span class="st ok">ROUTINES</span>From ${BOOK}: police on the beat, two to each beat, some of it on the roofs
    (pp251, 283); refuse collectors on Tai Chang Street at 4 a.m. (p93); street sweepers with their buckets (p104);
    meter readers with torches (p98); patients from outside at the dentists and doctors on the outer roads (p242);
    water from the one standpipe (p108); the Salvation Army kindergarten (p300); children who wrap candy after
    school (p77); tea and TV at the Old People's Centre, and worship on Sunday (pp305–306); whole families on the roofs
    in the early evening, with the grandmothers minding the children while supper cooks below (p322).</li>
  <li><span class="st ok">LIVES</span>Testimony of residents and workers: ${HK01}, ${WEB} and ${WSJ}, and the
    postman's own words (${BOOK}, p149, 2014 edition). Most of it was recorded long after 1986, thus each quote
    has the tag "retrospective" and its year.</li>
  <li><span class="st ok">WATER</span>Two private suppliers, one for power and one for water; water to 2/F–3/F at
    6–7 a.m. and to 3/F–4/F at 8–9 a.m. (林羅平, HK01 2024); about 70 wells (Gordon Jones, WSJ 2014);
    eight Government standpipes in 1987, and "Only one of these was located within the City", on Tai Chang
    Street (${BOOK}, pp28, 107; 葉德偉, HK01 2016).</li>
  <li><span class="st ok">FACES</span>Window cages, signs, roof tanks and TV aerials follow the photos of 1987–90
    (${MPLUS}).</li>
  <li><span class="st ok">COLOUR</span>About 110 colour patches measured in the photos of ${BOOK}: the render and
    paint of the faces, the grilles ("dark green or orange rust-preventing paint", p150, and pale blue), the
    dark inside of the cages, which fills 40–63 % of an open face (pp18, 26, 143), the grime and rust streaks
    (pp14, 96–97), the roofs and sheds (pp313, 327), and the boards: most are white or cream with black
    characters, about one in ten is coloured, and none is neon (pp8, 61, 285).</li>
  <li><span class="st ok">LIGHT</span>A lane is 10–35 % as bright as an open face, with pools of light under tubes
    and bulbs; daylight reaches the ground only at gaps (p103), and Lo Yan Street is "the only street that had
    some degree of natural lighting" (p23). Tubes are near-white, windows at dusk blue-white, some rooms have
    warm bulbs, and Kowloon beyond is sodium amber (pp16–17, 30, 42, 316). Corridors are whitewashed and lit
    by tubes; stairs have mosaic treads (pp165, 177).</li>
  <li><span class="st ok">CLOTHES</span>December clothes from the photos of ${BOOK}: navy or black padded jackets for
    old people (p306), a white blouse and a navy skirt for schoolgirls (p322), vests and yellow or pink tops for
    small children (pp322–325), singlets in the workshops (pp246–247), pale shirts and grey trousers, floral
    pyjama suits (p36), quilted vests and cardigans (p30), and police in a dark uniform and a peaked cap
    (pp220, 252). Hui Tung Choy wears a beige sweater and a grey flat cap (p171); Chan Kwan Leung wears a black
    polo and jeans (p321). People carry flour sacks (pp246, 248), buckets (pp104, 108), baskets, LP gas
    cylinders (p179) and the postman's bag (p144).</li>
  <li><span class="st ok">LANES</span>Upper floors overhang the lanes (p131). Plastic and metal sheets, and
    bundles of pipes and cables, hang over them (pp10, 106–107, 144, 249). Postboxes stand at the entrances
    (p188) and meter banks at the stairs (p101). A well is near the standpipe (map no. 34, p120).</li>
  <li><span class="st ok">PLANES</span>Airliners on the runway 13 approach to Kai Tak passed low beside the city
    (a police officer, SCMP 2018; the tailor across the road, HK01 2022).</li>
  <li><span class="st ok">AROUND</span>The model draws the real buildings, roads and open ground within 600 m of the
    city, as they stood in December 1986 (<code>data/context.json</code>). They come from the Lands Department
    1:1000 survey sheets of 1987 (with the editions of 1981–85 as a check) and the building and road data of
    ${CSDI}. Source: the Government of the Hong Kong SAR and the CSDI Portal. Each building stands from the ground
    to its height. In the data, 614 heights are from the building data, or storeys × 2.9 m; the other 651 are inferred, and
    the data marks each one. Mei Tung House 美東樓 (12 storeys, 1974), the long slab across Tung Tau Tsuen Road,
    stands whole. A building that hides a part of the city fades to a faint ghost, so that the city stays in
    view. Its shadow does not change. Tung Tau Estate Block 22 (16 storeys, 1965) stands across Tung Tsing Road, and on December
    mornings its shadow can reach the east face of the city. The roads are at their widths on the 1987 sheets.
    The open ground is the cleared ground of Sai Tau Tsuen, the building sites, the market and the football
    field. The fit of the city on the 1987 sheet also gives the bearing of the model: 63.6°, not 60°. Thus north,
    the sun and the approach of the planes turn 3.6°.</li>
</ul>

<h4>People of the 1992 map, not in the model</h4>
<p>The 1992 map (${BOOK}, pp352–353) also names these ${others.length} people. The model does not show them.
${others.some((p) => p.place) ? `For nos. ${others.filter((p) => p.place).map((p) => p.n).join(', ')}, the key also names a place. The label
tool (key M) shows these numbers with the place only.` : ''}</p>
<ul>
  ${others.map(mapPerson).join('\n  ')}
</ul>

<h4>Inferred, and marked</h4>
<ul>
  <li><span class="st prov">HEIGHT</span>Storeys away from the south face and Tung Tau Tsuen Road: a tall rim of
    10–15 and lower blocks round the Yamen, as the 1989 aerial photos show.</li>
  <li><span class="st prov">ROUTES</span>Where each link, bridge and roof ladder is. The blocks of one tower connect on
    every storey; two towers connect on about one storey in five. People take the quickest way: through the links and
    over the roofs, or down to the lanes. A lane route counts as 1.4 times the straight distance.</li>
  <li><span class="st prov">PLANS</span>Where each stair, corridor and wall runs. A block with no lane frontage
    shares the stair of the next block. Each home flat gets cubicles and bed spaces after the survey flat.</li>
  <li><span class="st prov">FLATS</span>The home floors hold 8,800 flats, as the book counts. Thus a flat in the
    model is about 15 m² (160 sq ft), less than the 200–400 sq ft that residents give (WSJ 2014, SCMP 2013).</li>
  <li><span class="st prov">TRADE</span>The 459 premises fill 268 floors, and the places of the book fill 4 more.
    Each workshop room counts as one business, and 280 more floors get a trade from the 1983 mix, until the
    count is 645. No file records
    them. The panel of a building marks each one with *, and the floor-use highlight of the legend draws a dashed outline
    round each.</li>
  <li><span class="st prov">PLACE</span>Where each premises sits on its street: the order of its house number.</li>
  <li><span class="st prov">STOREY</span>3.05 m for each storey, a usual Hong Kong tenement storey. No measured
    height is in hand.</li>
  <li><span class="st prov">LANES</span>The plan draws the lanes wider than the real 0.6–1 m, thus the model's
    lanes are 1–2 m wide.</li>
  <li><span class="st prov">HOURS</span>The hour-by-hour week of every person, the real people too. A 1980s Hong
    Kong week: six days of work and school, Saturday school in the morning, Sunday off for most. The hours of
    the book are from about 1990, thus they are approximate for 1986. When the book gives no hours, the model
    uses the usual hours of the trade. On 冬至 every shop and workshop shuts at 18:00.</li>
  <li><span class="st prov">ROLES</span>The share of each kind of resident. "About a third" of the residents were
    over 60 in about 1990 (p178); the model gives 18 % for 1986. The number of each kind of visitor: 6 police,
    3 refuse collectors, 10 sweepers, 2 meter readers and 300 patients. Their days and hours.</li>
  <li><span class="st prov">HOMES</span>Where a person of the book lives, when the book does not say: a flat near
    the work, with a household of three, the mean of the city (p340).</li>
  <li><span class="st prov">冬至</span>Family dinners on Monday 22 Dec 1986. 冬至 is a Hong Kong-wide custom; the
    model infers that the city's families kept it too.</li>
  <li><span class="st prov">LINES</span>The route of each cable and pipe is a diagram. No map of them survives.</li>
  <li><span class="st prov">WEAR</span>Who wears what, and who carries what when: the model picks it by role and by
    what each person does. A body has three sizes: child, adult, and old with a stoop.</li>
  <li><span class="st prov">POSE</span>How each person stands, sits, works or sleeps, by what they do. On the cut storey,
    people take the beds, seats and work places of their own room: two to a bed, and mats on the free floor at
    night. Who takes which place is a guess. At night a lamp lights each room of the cut storey while someone in
    it is awake: a bulb in a flat, tubes in a workshop. A room where all sleep is dark.</li>
  <li><span class="st prov">DETAIL</span>Which building gets which colour, cage, overhang and stain; where each sheet,
    pipe bundle, postbox wall and meter bank is; what stands on each roof (pot plants, stools, junk, bird cages;
    pp312–327); what lies in each room (bowls, flasks, rice cookers, fans, basins, bags, drums of pellets) and
    outside each door (iron gates, shoes, rubbish); what each window cage holds (pots, boxes, laundry, bird cages)
    and what hangs behind each window (curtains, blinds, newspaper); and which windows are lit at each hour. The floor lines of each
    building move up or down a little from its neighbours' (p143), but the storeys that people walk on do not
    move.</li>
  <li><span class="st prov">FLIGHTS</span>Landing times: about 89 a day, from 64,874 aircraft movements in 1986, and
    none from midnight to 06:30, the night curfew. Both come from search extracts of the government's figures
    that are not checked, and the curfew has no date (<code>primary-sources/README.md</code>). From 14:25 to 16:40
    the landings are about 20 minutes apart, for the lull that the pigeon breeder waited for (p321). No timetable
    gives these times. Every landing comes in on runway 13, beside the city; no source gives the runway in use that
    week.</li>
  <li><span class="st prov">FLOCK</span>The 34 birds that circle over the pigeon breeder's roof while he flies them, and
    their size, larger than a real bird so that the flock shows. The book gives no count.</li>
  <li><span class="st prov">POST</span>The hours of the postman's round: sorting from 7:00, Lo Yan Street from 8:20,
    lunch 12:30–13:15, delivery outside the City from 14:00, off at 15:30, and on Saturday off at about 11:00.
    The book gives the order of the round but no times.</li>
  <li><span class="st prov">HINTS</span>The game reads the model as it runs. The Where circle does not centre on the
    person, and the Which hint gives a band of three storeys; both change each half hour. Your hints and finds stay
    in this browser only.</li>
  <li><span class="st prov">MAP</span>The 1992 map "cannot be considered entirely accurate" (p353). For five people
    (nos. 19, 21, 24, 25 and 40) it disagrees with the address in the text. The model puts nos. 21, 24 and 25 at
    the address, and the box of each person gives the note. The list of the map's people gives the note for
    nos. 19 and 40. For the Fuk Tak Temple (no. 12) the map
    disagrees with the clearance files; its plate has a dashed frame, and its card gives the note.</li>
  <li><span class="st prov">LABELS</span>Each street name lies along its lane: on the line that fits the lane
    near the place where the plan prints the name. In the normal view it lies at the height of the roofs beside
    the lane, with thin lines down to the lane floor. Each place number lies on the building where the model
    puts the place. For a place that the model does not put, the number lies on the building under it on the
    1992 map. The card of a number gives the distance to the number on the map, if it is more than 8 m.</li>
  <li><span class="st prov">YAMEN</span>The roof form of each hall.</li>
  <li><span class="st prov">KOWLOON</span>The greys of the buildings, roads and open ground round the City, and the
    lit windows at night: their count at each hour and which ones are lit. The 9 road segments with no measured
    width (each 280 m or more from the centre of the City) are 7 m wide. The dark street under the City ends at
    the kerbs of the real roads; its shape is not a source. The colours of the sky and the haze at each height of
    the sun.</li>
  <li><span class="st prov">BUILDING</span>What a click selects as one building: a tower of the 1987 plan (p134), and
    the 17 halls of the Yamen as one. This gives 270 buildings. The plan fits the traced plots only approximately,
    thus a tower can differ from the real building. Each building has the same plots on each storey. Suenn Ho's
    drawing on p137 shows a building whose upper storeys grow over its neighbours; the model has no such
    building. The panel of a building gives the file addresses of its blocks as its name. If no file gives an
    address, the name is the house number of its place on the street, after "near", or else a number.</li>
</ul>

<h4>Sound, from primary sources</h4>
<p>The sound is off at first. Turn it on with the speaker tool or the key S. It follows the clock:
it fades out when the clock stops, and at three arrows, the fastest speed, you hear only the soft
bed. The browser makes each sound, and the app has no recordings.</p>
<ul>
  <li><span class="st ok">HUM</span>A low hum of the wires, the same at night and by day: "Night and day within the
    Walled City were the same, with buzzing electrical wires, dripping pipes" (a police officer, SCMP 2018).
    The hum is at 50 Hz, the mains frequency of Hong Kong.</li>
  <li><span class="st ok">DRIPS</span>One pipe drips a few times, at all hours: "the constant dripping" (${BOOK},
    pp148–149); "when we heard the sound of water dripping" (Tam Sau-kuen, ${WSJ}).</li>
  <li><span class="st ok">PLANE</span>An airliner swells and fades as it passes on the approach to Kai Tak, at the
    landing times of the model. The real noise stopped all talk (林財銳, the tailor across the road, HK01 2022).
    The model plays it soft. It plays at most about one landing each minute.</li>
  <li><span class="st ok">PIGEONS</span>Chan Kwan Leung whistled before he fed his pigeons (${BOOK}, p320). He flew
    them "usually in mid-afternoon when there was a lull in the number of landings at Kai Tak" (p321). Each day
    the model plays his whistle and the wings in the longest gap between landings from 14:30 to 16:30. In those
    hours the flock also circles, with a softer flutter. The tune of the whistle is inferred.</li>
  <li><span class="st ok">COOKING</span>A cleaver on a block, or food in a hot wok, at lunch and at dinner:
    "人們在煮食，聲音不斷傳出來" [people were cooking; sounds came out all the time] (Greg Girard, HK01 2024).
    On the evening of 冬至 the model plays more cooking.</li>
  <li><span class="st ok">MAHJONG</span>The tiles after work, until about 1 a.m.: 林羅平 played mahjong with other
    bosses (HK01 2024, narration). The model plays more on Saturday and on the night of 冬至.</li>
  <li><span class="st ok">PING PONG</span>A rally in a corridor from 7 to 10 p.m.: "We would just play ping pong in
    the hallway" (Albert Ng, SCMP 2013). The model plays more on Saturday.</li>
</ul>

<h4>Sound, inferred and marked</h4>
<ul>
  <li><span class="st prov">CITY</span>The soft bed: a murmur of the dense city, and a low rumble from the roads
    outside. It is quiet from 1 to 5 a.m., full by day, and a little lower on Sunday. No source records it.</li>
  <li><span class="st prov">LOOM</span>A loom through a wall, from 8 a.m. to 7 p.m., but not on Sunday. On 冬至 it
    stops at 5.30 p.m. The weaving workshops are in the sources (Lau Yeung Yin, ${BOOK}, p48; 織布廠, HK01 2016),
    but their sound is not.</li>
  <li><span class="st prov">SHAPE</span>The hour, the loudness and the shape of each sound. The sounds do not come
    from a place in the model, and they do not follow the camera.</li>
</ul>

<h4>Secondary, for scale only</h4>
<ul>
  <li><span class="st prov">SIZE</span>26,000 m² for the plots and lanes (${LCSD}); about 700 ft for the long side
    in the 1898 survey (${ZHWP}).</li>
</ul>
<p>Visual language after Andrew Blinn's exploded-city prototype
(${A('https://x.com/disconcision/status/2115661869478469848', 'x.com/disconcision')}).
Three weeks after this week, on 14 January 1987, the government announced the clearance of the city.</p>
`;
