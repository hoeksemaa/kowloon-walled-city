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
const PRESS = GH('press-articles-1959-1992', 'Baltimore Sun 1992');
const LCSD = A('https://www.lcsd.gov.hk/en/parks/kwcp/historical.html', 'LCSD');
const ZHWP = A('https://zh.wikipedia.org/wiki/九龍寨城', 'ZH Wikipedia');
const BOOK = GH('city-of-darkness-revisited', 'City of Darkness Revisited (2014)');
const OSM = A('https://www.openstreetmap.org/relation/1650915', 'OSM relation 1650915');

export const SOURCES_HTML = `
<p>One ordinary week in the city at its height: Tuesday 16 to Monday 22 December 1986, the
day of 冬至 (the winter solstice). Nine real people appear with their own recorded words,
marked REAL PERSON. Every other person is a composite. A detail that no source records is
marked inferred.</p>

<h4>From primary sources</h4>
<ul>
  <li><span class="st ok">PLAN</span>Lanes, 474 plots, the Yamen compound, factory sites and named buildings
    are traced from ${PLAN}, on display in Kowloon Walled City Park (photo by Lord Jaraxxus,
    CC BY-SA 4.0). The traced grid in <code>data/plan.json</code> is CC BY-SA 4.0 too. The model draws
    each plot as a polygon with straight walls, not as grid steps.</li>
  <li><span class="st ok">SHOPS</span>459 premises with street, house number, floor, name and trade, from the
    titles of the clearance files of 1987–92 (${GRS}). The signs carry these names.</li>
  <li><span class="st ok">TRADES</span>The Kai Fong Association counted 645 shops, workshops and clinics in 1983,
    97 of them dentists (charted in ${WSJ}).</li>
  <li><span class="st ok">BOOK</span>${BOOK}, by Greg Girard and Ian Lambot: the street names Tai Chang St,
    Almshouse Back St, Tin Hau Temple St and Lung Chun Back Rd, and the 40 numbered places of its 1992 map
    (pp352–353; the 1992 MAP tool, key M). The book counts "some 300 individual buildings", "28,200
    occupants" and "8800 separate apartments" in January 1987 (p340). The map and the 1987 figure-ground plan
    (p134) are fitted to the traced plan by <code>tools/book_overlay.py</code>. The 1987 plan joins the 474
    plots into 311 towers. Only numbers go into <code>data/</code>; no image from the book is in the app.</li>
  <li><span class="st ok">STAIRS</span>Suenn Ho's stair types (${BOOK}, pp138–139): a stair in the centre or at the
    side, a corridor with a stair at each end, and stairs that two or three buildings share.</li>
  <li><span class="st ok">FLATS</span>Two floors that the clearance survey drew in 1987 (p340): the 4/F flat of
    6 Sai Shing Road, measured on 9 Nov 1987, and a 5/F of 3 Cheung On Lane where three stairs meet. The
    model draws the rooms of the first and gives the units of the second their survey addresses. It places
    both by house number.</li>
  <li><span class="st ok">HEIGHT</span>Storeys along the south face, read off Lambot's south elevation of 1990
    (${MPLUS}, 2017.412). On Tung Tau Tsuen Road, "12 storeys and more" from 1972 (p132), and one
    building of 14 storeys from 1975 (p336).</li>
  <li><span class="st ok">NUMBERS</span>House numbers fall from west to east on Tung Tau Tsuen Road and Lung Chun
    Road, and from north to south on Sai Shing Road (Suenn Ho's route map, ${HO}).</li>
  <li><span class="st ok">PEOPLE</span>About 10,000 families (written answer, 18 Feb 1987) and 33,000 residents
    (the Governor, 12 Oct 1988), in ${HANSARD}.</li>
  <li><span class="st ok">LIVES</span>Testimony of residents and workers: ${HK01}, ${WEB}, ${WSJ} and ${PRESS}.
    Most of it was recorded long after 1986, thus each quote has the tag "retrospective" and its year.</li>
  <li><span class="st ok">WATER</span>Two private suppliers, one for power and one for water; water to 2/F–3/F at
    6–7 a.m. and to 3/F–4/F at 8–9 a.m. (林羅平, HK01 2024); about 70 wells (Gordon Jones, WSJ 2014);
    eight Government standpipes in 1987, and "Only one of these was located within the City", on Tai Chang
    Street (${BOOK}, pp28, 107; 葉德偉, HK01 2016).</li>
  <li><span class="st ok">FACES</span>Window cages, signs, roof tanks and TV aerials follow the photos of 1987–90
    (${MPLUS}).</li>
  <li><span class="st ok">PLANES</span>Airliners on the runway 13 approach to Kai Tak passed low beside the city
    (a police officer, SCMP 2018; the tailor across the road, HK01 2016).</li>
</ul>

<h4>Inferred, and marked</h4>
<ul>
  <li><span class="st prov">HEIGHT</span>Storeys away from the south face and Tung Tau Tsuen Road: a tall rim of
    10–15 and lower blocks round the Yamen, as the 1989 aerial photos show.</li>
  <li><span class="st prov">PLANS</span>Where each stair, corridor and wall runs. A block with no lane frontage
    shares the stair of the next block. Each home flat gets cubicles and bed spaces after the survey flat.</li>
  <li><span class="st prov">FLATS</span>The home floors hold 8,800 flats, as the book counts. Thus a flat in the
    model is about 15 m² (160 sq ft), less than the 200–400 sq ft that residents give (WSJ 2014, SCMP 2013).</li>
  <li><span class="st prov">TRADE</span>The 459 premises fill 268 floors. Each workshop room counts as one
    business, and 291 more floors get a trade from the 1983 mix, until the count is 645. No file records
    them, and the tooltip marks each one with *.</li>
  <li><span class="st prov">PLACE</span>Where each premises sits on its street: the order of its house number.</li>
  <li><span class="st prov">STOREY</span>3.05 m for each storey, a usual Hong Kong tenement storey. No measured
    height is in hand.</li>
  <li><span class="st prov">LANES</span>The plan draws the lanes wider than the real 0.6–1 m, thus the model's
    lanes are 1–2 m wide.</li>
  <li><span class="st prov">HOURS</span>The hour-by-hour week of every person, the real people too. A 1980s Hong
    Kong week: six days of work and school, Saturday school in the morning, Sunday off for most.</li>
  <li><span class="st prov">冬至</span>Family dinners on Monday 22 Dec 1986. 冬至 is a Hong Kong-wide custom; the
    model infers that the city's families kept it too.</li>
  <li><span class="st prov">LINES</span>The route of each cable and pipe is a diagram. No map of them survives.</li>
  <li><span class="st prov">FLIGHTS</span>Landing times: about 89 a day, from a 1986 traffic figure that is not checked.</li>
  <li><span class="st prov">MAP</span>The 1992 map "cannot be considered entirely accurate" (p353). For five places
    it disagrees with the address in the text; their discs have a dashed ring, and the tooltip gives the address.</li>
  <li><span class="st prov">YAMEN</span>The roof form of each hall; the city below the plinth.</li>
</ul>

<h4>Sound, from primary sources</h4>
<p>The sound is off at first. Turn it on with the speaker tool or the key S. It follows the clock:
it fades out when the clock stops, and above 60× you hear only the soft bed. The browser makes
each sound, and the app has no recordings.</p>
<ul>
  <li><span class="st ok">HUM</span>A low hum of the wires, the same at night and by day: "Night and day within the
    Walled City were the same, with buzzing electrical wires, dripping pipes" (a police officer, SCMP 2018).
    The hum is at 50 Hz, the mains frequency of Hong Kong.</li>
  <li><span class="st ok">DRIPS</span>One pipe drips a few times, at all hours: "the constant dripping" (${BOOK},
    pp148–149); "when we heard the sound of water dripping" (Tam Sau-kuen, ${WSJ}).</li>
  <li><span class="st ok">PLANE</span>An airliner swells and fades as it passes on the approach to Kai Tak, at the
    landing times of the model. The real noise stopped all talk (林財銳, the tailor across the road, HK01 2022).
    The model plays it soft. It plays at most about one landing each minute, but a story scene always gets its
    plane.</li>
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
    in the 1898 survey (${ZHWP}); the bearing of Tung Tau Tsuen Road (${OSM}, ODbL).</li>
</ul>
<p>Visual language after Andrew Blinn's exploded-city prototype
(${A('https://x.com/disconcision/status/2115661869478469848', 'x.com/disconcision')}).
Three weeks after this week, on 14 January 1987, the government announced the clearance of the city.</p>
`;
