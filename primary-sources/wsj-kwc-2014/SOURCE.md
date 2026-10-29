# *The Wall Street Journal*, "Kowloon Walled City" interactive (2014)

A web project by WSJ.com News Graphics, published in April 2014. It has a
"People" chapter with six former residents and workers, and an "Explore"
chapter with more quotes, a trade count and clips of Suenn Ho's footage. The
live site is gone. The Wayback Machine keeps the page and its data files.

- **Link:** https://web.archive.org/web/20161228012123/http://projects.wsj.com/kwc/
- **Original URL:** http://projects.wsj.com/kwc/ (offline)
- **Data files:** the page loads its text from
  `http://projects.wsj.com/kwc/getData.php?f=grabChapter&chapter=<id>`, with
  `<id>` = `people`, `life`, `history`, `pop`, `legacy`. The chapter list is
  `getData.php?f=fetchChapters`.
- **Video metadata:** `https://video-api.wsj.com/api-video/find_all_videos.asp?type=guid&query=<GUID>&fields=name,description,linkURL,formattedCreationDate,duration`
- **Published:** the six resident videos have creation dates of 15–21 Apr 2014.
- **Retrieved:** 2026-10-29. I read the `people`, `life` and `history` data
  files and the video metadata in a browser. I did not save them (see below).
- **Copyright:** © Dow Jones & Company. Photos and clips are credited to Suenn
  Ho, Betty Ho, Calvin Yeung, Ko Tim Keung, Rod Mason and others.
- **Stored in git:** no.

## Why this is primary (which parts)

The residents' own quotes are first-hand testimony, given to WSJ in 2013–14.
Tag them "retrospective (2014)". The fact box for each person (years, address,
floor, family size, rent or price) comes from the same interviews. Treat it as
testimony, not as a record.

The WSJ narration (the "dek" text and the history timeline) is secondary. Use
it only to find leads. The clips under "Take a Walk" are Suenn Ho's own
footage of 1988–1992 (see `mplus-suenn-ho-ca17/`). They are primary, but I
did not watch them.

The page gives each quote in English and in simplified Chinese. I do not know
which is the original wording. Below, the English is the published text.

## Files to save

`curl` was not permitted in this session. Thus `local/` is empty. Run these
commands from this folder, then add the SHA-256 of each file here. The `id_`
form of a Wayback URL gives the archived bytes without the Wayback toolbar.

```
mkdir -p local
B='https://web.archive.org/web/2016id_/http://projects.wsj.com/kwc'
curl -sL -A 'Mozilla/5.0' -o local/wsj-kwc-index.html 'https://web.archive.org/web/20161228012123id_/http://projects.wsj.com/kwc/'
for c in people life history; do
  curl -sL -A 'Mozilla/5.0' -o local/wsj-kwc-chapter-$c.json "$B/getData.php?f=grabChapter&chapter=$c"
done
curl -sL -A 'Mozilla/5.0' -o local/wsj-video-api-residents.json 'https://video-api.wsj.com/api-video/find_all_videos.asp?type=guid&query=FD1945F1-D6A5-43B2-ACED-B3E60C235553,A683C456-D647-4868-8BB3-3494427A98F0,F884D3C1-1E9C-4EC1-9142-14B7DC1F3396,50FB8014-2C19-433A-B907-4C29CF6509F0,19C2631C-36C2-4F5F-916A-271516DE6609,4C437F64-E761-4D61-89AB-45D86580ABB5&fields=name,description,linkURL,formattedCreationDate,duration'
shasum -a 256 local/*
```

| File | What | SHA-256 |
|---|---|---|
| `local/wsj-kwc-index.html` | The page, capture of 2016-12-28 | not saved yet |
| `local/wsj-kwc-chapter-people.json` | "People": six residents and workers | not saved yet |
| `local/wsj-kwc-chapter-life.json` | "Explore": quotes, trade count, clip list | not saved yet |
| `local/wsj-kwc-chapter-history.json` | "Rise & Fall" timeline (secondary) | not saved yet |
| `local/wsj-video-api-residents.json` | Titles, lengths, dates of the six resident videos | not saved yet |

## The resident videos

Each video is short and in WSJ's archive. A transcript of each is still a task.

| Video | Length | Link |
|---|---|---|
| "Child" (Albert Ng) | 52 s | https://www.wsj.com/video/kowloon-walled-city-characters-child/FD1945F1-D6A5-43B2-ACED-B3E60C235553 |
| "Dim Sum Hawker" (Yeung Lai-wan) | 63 s | https://www.wsj.com/video/kowloon-walled-city-characters-dim-sum-hawker/A683C456-D647-4868-8BB3-3494427A98F0 |
| "Mapmaker" (Chan Cheung-chuen) | 73 s | https://www.wsj.com/video/kowloon-walled-city-characters-mapmaker/F884D3C1-1E9C-4EC1-9142-14B7DC1F3396 |
| "Triad" (Paul Tang) | 70 s | https://www.wsj.com/video/kowloon-walled-city-characters-triad/50FB8014-2C19-433A-B907-4C29CF6509F0 |
| "Fishball Makers" (Wong Yum-fai) | 92 s | https://www.wsj.com/video/kowloon-walled-city-characters-fishball-makers/19C2631C-36C2-4F5F-916A-271516DE6609 |
| "Postman" (Lam Po-chun) | 86 s | https://www.wsj.com/video/kowloon-walled-city-characters-postman/4C437F64-E761-4D61-89AB-45D86580ABB5 |

## Key facts

All items are retrospective (2014) unless a note says otherwise.

**The six people in "People" (fact boxes).**

| Person | Role | Years inside | Address | Household | Home |
|---|---|---|---|---|---|
| Albert Ng Kam-po | the boy; Chiu Chow family | 1975 – 1991 or 1992 | Room A, 7/F, 8 Sz Kung St. (社公街) | 5 people | more than 200 sq ft, bought 1975 for about HK$50,000 |
| Yeung Lai-wan 杨丽云 | dim sum hawker, mother of nine | 1959–1981 | 2/F, Sai Shing Rd.; 3/F, 60 Lung Chun Rd.; 4/F, Lung Chun Rd. | income HK$6,000–7,000 a month | 200, 600, 500 sq ft; HK$10,000 (bought 1974) |
| Chan Cheung-chuen | map maker, engineering student | 1985–1991 | 12/F, Room B, 31 Tung Tau Tsuen Rd.; 11/F, Room 2, 16 Tung Tau Tsuen Rd. | 3 people; about HK$15,000 a month | 200–300 sq ft; rent HK$800–900 (1985–88), HK$1,100 (1988–91) |
| Tang Kam-cheung (Paul) 邓金祥 | former triad, later a pastor | 1948–1979 | G/F, Lung Chun Rd., 2nd Lane | 7 people; HK$8–10 a day | 400–500 sq ft |
| Wong Yum-fai, father; Wong Chun-ping, son | fishball makers | 1972–1983 | home 8/F, 33 Lo Yan St. (老人街); shop G/F, same building | 8 people | 500 sq ft |
| Lam Po-chun | postman | worked inside 1979–1991 | – | – | – |

- Chan Cheung-chuen finished his hand-drawn map in March 1987 (WSJ
  narration). It took four months.
- Wong Yum-fai sold 30 catties of fishballs a day. A bowl of fishball noodles
  cost HK$0.30 to HK$0.80.
- Lam Po-chun: daily shift 8 hours; "Buildings: 350 (estimate)"; "Buildings
  with elevators: 2".
- Yeung Lai-wan's dim sum prices in the 1970s: siu mai HK$0.10, Chiu Chow
  dumplings HK$0.15, bao HK$0.80. WSJ gives the source as "Wong Chan Pui-wah
  (1971)".
- Conflict: the fishball video says Wong Yum-fai "lived inside Hong Kong's
  Kowloon Walled City for 30 years". His fact box says 1972–1983.

**Water, power, refuse.**
- Tam Sau-kuen 谭秀娟, housewife: "There was no 24-hour water supply in
  Kowloon Walled City… No matter what time it was, even while we were
  sleeping at night, when we heard the sound of water dripping, we would
  immediately wake up and do the housework such as laundry and washing the
  dishes."
- Wong Chan Pui-wah 黄陈佩华, garment-factory worker: "We had to pay somebody
  to 'steal' electricity for us."
- Gordon Jones, former Kowloon City District Officer: "The water was largely
  derived from about 70 or so wells, which the inhabitants of the Walled City
  had sunk… The actual quality of the water was pretty appalling."
- Gordon Jones: "there were no significant fires or outbreaks of disease" in
  "the 30 to 40 years the Walled City existed as a high-rise slum".
- WSJ narration (secondary): "only one official government standpipe located
  inside the Walled City's boundaries, and seven on its perimeter". Lower
  floors flooded often. Many people kept cats against the rats.

**Building, entrances, self-government.**
- Chan Hau-lin 陈厚练, building developer: "You didn't need any paperwork from
  the government for construction, so you had to collaborate with your
  neighbors yourself. Oh, and also be aware of the building height limits."
- WSJ narration: most buildings rose to "between 10 and 14 stories, though
  there were only two with elevators". There were "66 entry points".
- Yip Tak-wai 叶德伟, head of the former residents' association: "Even though
  it seemed like the Walled City was an ungoverned place, it was actually a
  self-governing community."
- WSJ narration: the Kai Fong Association, formed in 1963, put up posters such
  as "Prevent Fire: Protect Your Life and Property" and "Let's Help Each
  Other: Clean Up the Street".

**Trades: the Kai Fong Association count of 1983.** WSJ charts "Shops,
Factories and Clinics", with the source "Kowloon Walled City Kai Fong
Association (1983)". I did not see the original count.

| Dentist | Plastic | Clinic | Shop | Metal | Garment | Manufacturing | Meat production | Cake production | Textile | Others |
|---|---|---|---|---|---|---|---|---|---|---|
| 97 | 93 | 89 | 77 | 56 | 44 | 41 | 35 | 33 | 30 | 50 |

The sum is 645.

**Schools, temples, the Yamen (WSJ narration, secondary).**
- A church ran an "Aged People Centre" in the Yamen from the 1970s.
- The Salvation Army ran a primary school, then a kindergarten. Wong Chan
  Pui-wah: "Many children went to school there. We played together and sang
  songs. It was very happy."
- The Hong Kong Federation of Youth Groups ran a youth centre.
- Fuk Tak Temple was "popular with residents from the southern Chinese city
  of Chiu Chow".
- The Tin Hau Temple "was often blocked from sunshine by the garbage residents
  scattered on the tin grate above it".

**Vice and police.** Most of this is about the 1950s–60s, not 1986.
- Paul Tang: "The police would patrol at certain hours, but they didn't stay
  in the Walled City for long. They didn't conduct investigations inside.
  They just walked by."
- Paul Tang: "When people couldn't afford heroin, they would die. Family
  members would move the dead bodies to the restrooms."
- Paul Tang, about 1959–62: protection money HK$5 a day; opium HK$5, heroin
  HK$0.30, red pill HK$0.20.
- Tam Sau-kuen, as a child: "The area where they stayed was dark 24 hours a
  day." This is about the sex workers on Tai Chang Street (大井街).
- Lau Kam-chiu 刘锦朝, electrician: "We lived in the Walled City, so we ignored
  this kind of thing. We didn't like it. We looked down on it."
- Yeung Lai-wan: "I saw a heroin addict dig out a cat's eye."
- Rod A. L. Mason, police officer, in a report of 1985 (made at the time):
  "There was little police could do as routine visits to suspected premises
  were often useless." WSJ also cites him for a 1985 price of 'services':
  HK$15 to HK$30. The report itself is a lead.

**Suenn Ho clips ("Take a Walk").** Eight markers on a route: "Start here",
"Watch a game of chess", "Visit a factory", "Lose your way", "Candy factory",
"Get stopped by the police", "Play time", "Look at a well". The `life` file
gives a WSJ video GUID for each clip.

**Others quoted (first-hand, not residents).**
- Sir David Akers-Jones: "the streets were lined with illegal dentists, right
  in the open."
- Hamdani Milas, documentary filmmaker, about the entrances: "They were just
  narrow openings between the shops."
