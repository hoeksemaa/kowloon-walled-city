// Shown in the "Sources + notes" panel. Each item says whether the model uses it as a
// sourced fact or as a placeholder. Full notes with citations: research/kwc-research.md.
const A = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const PLAN = A('https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg', 'exhibit plan');
const WSJ = A('https://web.archive.org/web/2016id_/http://projects.wsj.com/kwc/getData.php?f=grabChapter&chapter=life', 'WSJ 2014');
const LAI = A('https://mdpi-res.com/d_attachment/land/land-13-02112/article_deploy/land-13-02112.pdf', 'Lai 2024');
const ATLAS = A('https://www.atlasobscura.com/articles/kowloon-walled-city', 'Atlas Obscura');
const OSM = A('https://www.openstreetmap.org/relation/1650915', 'OSM relation 1650915');
const LCSD = A('https://www.lcsd.gov.hk/en/parks/kwcp/historical.html', 'LCSD');
const ZHWP = A('https://zh.wikipedia.org/wiki/九龍寨城', 'ZH Wikipedia');

export const SOURCES_HTML = `
<p>Draft 0.2. The ground plan now comes from a real 1980s plan of the city. The heights,
the floor uses and the daily life are still placeholders, and each one is marked here.</p>

<h4>Sourced</h4>
<ul>
  <li><span class="st ok">PLAN</span>Lanes, 474 plots, the Yamen compound and the outline are traced from the
    ${PLAN}, a photo of the street plan on display in Kowloon Walled City Park
    (photo by Lord Jaraxxus, CC BY-SA 4.0). The traced grid in <code>data/plan.json</code> is CC BY-SA 4.0 too.
    The plan draws lanes wider than the real 0.6–1 m, so the model's lanes are 1–2 m.</li>
  <li><span class="st ok">SIZE</span>Scaled so the lanes and plots cover 26,000 m² (${LCSD}). The long side
    is then about 209 m, against 700 ft (213 m) in the 1898 survey (${ZHWP}).</li>
  <li><span class="st ok">ROADS</span>Lung Chun Road 龍津道 runs on the old south wall base; its name and house
    numbers are on the plan. Sai Shing Road 西城路 runs on the old west wall base (${ZHWP}). Outside, only
    Tung Tau Tsuen Road and Tung Tsing Road touched the city.</li>
  <li><span class="st ok">STREETS</span>Five street names are read off the plan. Lung Shing Road and Sai Shing
    Road are placed from the descriptions in ${ZHWP}.</li>
  <li><span class="st ok">BEARING</span>The plan's top faces about 330°: Tung Tau Tsuen Road runs at about 59.5°
    beside the park (${OSM}, ODbL).</li>
  <li><span class="st ok">FACTORIES</span>The 32 plots with green dots on Kwong Ming Street are factory sites,
    as the plan's caption says.</li>
  <li><span class="st ok">NAMES</span>Youth centre, old people's centre (in the Yamen), Lung Chun Free School
    Building, Tin Hau temple and the Kai Fong Welfare Association, as labelled on the plan.</li>
  <li><span class="st ok">PEOPLE</span>33,000 residents in 10,700 households, 1987 survey (${ATLAS}; ${WSJ}).</li>
  <li><span class="st ok">TRADES</span>The trade types are the 11 categories of the 1983 Kai Fong count of
    645 businesses (${WSJ}). Dentists and doctors face Tung Tau Tsuen Road; food premises line Lung Chun Road.</li>
  <li><span class="st ok">DESIGN</span>Visual language after Andrew Blinn's exploded-city prototype
    (${A('https://x.com/disconcision/status/2115661869478469848', 'x.com/disconcision')}).</li>
</ul>

<h4>Placeholders, to replace with sources</h4>
<ul>
  <li><span class="st prov">HEIGHT</span>Storeys per building. The mix follows the totals: up to 14 storeys,
    mostly 10–14 by the 1980s, and some low structures (${LAI}). 3.05 m per storey, from "10 to 14 stories"
    and "100 to 140 feet" (${WSJ}).</li>
  <li><span class="st prov">USE</span>Which trade is in which building, and on which floor.</li>
  <li><span class="st prov">YAMEN</span>The roof form of each hall, and the height of the youth centre and the temple.</li>
  <li><span class="st prov">DAY</span>Roles and timetables of residents are rough guesses.</li>
  <li><span class="st prov">WIRES</span>Cable and pipe routes are random. The colours are a diagram, not real cable colours.</li>
  <li><span class="st prov">CITY</span>The city below the plinth is generic.</li>
</ul>
<p>People in this model are composites. Names are common Hong Kong surnames, given at random.</p>
`;
