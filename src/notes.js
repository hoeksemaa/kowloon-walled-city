// The "Sources + notes" panel of the main app: what the definitive structure takes from each
// source, and what it infers. The full notes: docs/structure.md and docs/rooms.md; the quotes:
// primary-sources/ (one folder per source).
const A = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const REPO = 'https://github.com/hoeksemaa/kowloon-walled-city/blob/main/';
const GH = (dir, text) => A(`https://github.com/hoeksemaa/kowloon-walled-city/tree/main/primary-sources/${dir}`, text);
const PLAN = A('https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg', 'the 1980s street plan');
const BOOK = GH('city-of-darkness-revisited', 'City of Darkness Revisited (2014)');
const MPLUS = GH('mplus-girard-lambot-photos', 'Girard and Lambot, M+');
const GRS = GH('grs-catalogue-kwc', 'GRS HKRS1255-3');
const CSDI = A('https://portal.csdi.gov.hk', 'the CSDI Portal');

// S: the structure; uses: the room uses (roomUses.js).
export function notesHtml(S, uses) {
  const c = uses.data.counts;
  return `
<p>Kowloon Walled City (九龍城寨) in the week of 16 to 22 December 1986, on its definitive 3D
structure: ${S.list.length} buildings with every storey, floor, stair, room and link, on the ground
and among the real buildings round the City. The structure was frozen on 4 November 2026
(${A(`${REPO}docs/structure.md`, 'docs/structure.md')}). It is a structural model only: it has no
furniture, signs or colours of its own, and the colours here are placeholders. A detail that no
source gives is marked inferred.</p>

<h4>The tools</h4>
<ul>
  <li><span class="st ok">E</span>Pull the floors apart: all the G/F floors in one layer, all the 1/F
    floors in the next, and so on. Each floor keeps its true place in its layer, thus the G/F of a
    building up the slope can stand higher than the 1/F of a building lower down. A roof goes with
    the layer of the floor over it. A dark plate lies in the gap under each layer.</li>
  <li><span class="st ok">RAIL</span>Peel the City to one storey (arrow keys: up and down): all
    the floors and roofs over it go, with all that is on the roofs, and its walls end 1.2 m over
    its floor. Thus every room of that storey shows from above.</li>
  <li><span class="st ok">CLICK</span>A building: its storeys, heights, stairs and links, and the
    use of its rooms in December 1986. A room of an open floor: its use and its sources.</li>
</ul>

<h4>From primary sources</h4>
<ul>
  <li><span class="st ok">PLAN</span>The lanes, the plots, the Yamen (衙門) and the outline of each
    building, traced from ${PLAN}, on display in Kowloon Walled City Park (photo by Lord Jaraxxus,
    CC BY-SA 4.0), on cells of 0.25 m. The 1987 figure-ground plan (${BOOK}, p134) gives the plots
    that stood as one building.</li>
  <li><span class="st ok">STOREYS</span>The south face from Lambot's elevation of 1990 (${MPLUS})
    and pp20-21; 12-13 storeys on Tung Tau Tsuen Road (東頭村道), one of 14 (pp132, 336); the low
    structures on the east edge from the survey sheet of May 1987; other counts from the 1989 aerial
    photo and from the bronze model in the park.</li>
  <li><span class="st ok">GROUND</span>The ground levels from the Lands Department (地政總署) terrain
    model, sheet 11-NE-11A of 1987: 7.6 m to 23 m in the City. The roads and the real buildings
    round the City from the 1:1000 survey sheets of 1987 (${CSDI}).</li>
  <li><span class="st ok">STAIRS</span>Suenn Ho's (何巽) stair types (${BOOK}, pp138-139), stairs that
    two or three buildings share, and buildings that grow over a lower neighbour (p137).</li>
  <li><span class="st ok">LINKS</span>Doors through party walls, bridges over the lanes, ladders
    between roofs and corridor windows with a stool under them (${BOOK}, pp145-146, and others).</li>
  <li><span class="st ok">ROOMS</span>${c.places} places of the sources (the clearance files,
    ${GRS}; the book; the press; the Kai Fong association, 九龍城砦街坊福利事業促進委員會), ${c.placed}
    of them placed: ${c.basis.verified} rooms verified and ${c.basis.likely} likely. The other
    ${c.basis.guess.toLocaleString()} rooms have a use guessed from the counts of the sources
    (${A(`${REPO}docs/rooms.md`, 'docs/rooms.md')}).</li>
</ul>

<h4>Inferred</h4>
<ul>
  <li><span class="st prov">HEIGHTS</span>Each building has its own G/F level (the ground at its door,
    plus one step) and its own storey heights: G/F 3.3-3.9 m, the floors above 2.7-3.0 m. Thus the
    floors of two neighbours seldom line up.</li>
  <li><span class="st prov">PLANS</span>The plan of each floor: the stair, the corridor and the units
    (flats of about 17 m², from flats of about 200 sq ft, p130). The parapets (about 1 roof in 5),
    the roof rooms, and where each link is.</li>
</ul>

<h4>Not yet on this structure</h4>
<p>The people of the week, the street names, the numbers of the 1992 map and the game Find them
(尋人) sat on the old city of this app. They come back in later changes, on this structure.</p>`;
}
