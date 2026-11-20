# HK Government Records Service (政府檔案處) (GRS): catalogue of Walled City (九龍城寨) records, 1963–1997

The GRS (the Public Records Office 歷史檔案館 of Hong Kong 香港) holds the government's own
files on the Walled City. These cover the clearance committees, the
compensation case for each business, police reports, water supply, and
unregistered doctors and dentists. Many file titles give an address, a floor,
a business name and a trade.

- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+Walled+City%22
- **Retrieved:** 2026-10-29, from the free online catalogue.
- **Access to the files:** you can read them only in the GRS Search Room, 2/F
  Hong Kong Public Records Building (香港歷史檔案大樓), 13 Tsui Ping Road (翠屏道), Kwun Tong (觀塘). Access is
  under the "Public Records (Access) Rules 1996". The catalogue does not say
  which files are open.
- **Copyright:** HKSAR Government (香港特別行政區政府). The CSV files in this folder are catalogue
  data only (references, titles, dates, links).
- **Stored in git:** yes, the CSV files. There are no record images.

## Why this is primary

The files are the working records of the bodies that surveyed, compensated,
policed and cleared the city. The file titles themselves come from those
bodies. For example, a case file title names the premises and the trade
that the clearance officers recorded.

## Files in this folder

Each CSV has the columns `ref`, `title`, `dates`, `level`, `url`.

| File | Rows | What | SHA-256 |
|---|---|---|---|
| `grs-hkrs1255-3.csv` | 692 | HKRS1255-3: case files for business claimants, 1984–1997, from the Lands Department (地政總署) (Acquisition) | `82cb1732476ce246f50a9206d80956ed371f5cc7167878378cdc9363d052af9a` |
| `grs-hkrs1255-2.csv` | 129 | HKRS1255-2: case files for claimants, 1987–1998, from the Lands Department (Legal Advisory and Conveyancing Office) | `7f9e04b8ee704459596c0256a466bd8824765ec9329fab05c11c0c61d06ce551` |
| `grs-hkrs1078-1.csv` | 87 | HKRS1078-1: confidential clearance files, 1987–1993 | `19ddd499c5d4a6d421b1164362a025623fbe136c8f8622375cf6c130bb3c63ed` |
| `grs-hkrs1077.csv` | 17 | HKRS1077-1, -2, -3: Home Affairs Department (民政事務總署), Clearance Appeals Section, 1900–2001 | `494ef78c0fab0da4cfb98c9945364335d67bbb3617d53ee8a8d003879619e03a` |
| `grs-search-kowloon-walled-city.csv` | 274 | All results for the search `"Kowloon Walled City"` (182 files, 6 items, 12 deposits, 17 series) | `a79364b3d5ab54e220ec237fc8d19dd7f1fcba1e6159392acdded9ad2b60ffda` |

I did not export HKRS1255-1 (792 catalogue pages, about 7,900 files). Its
titles show only "[name]" and dates, with no address.

## HKRS1255-3: the business map

The 692 file titles give the premises of the businesses that claimed
compensation. Examples:

- "G/F, 72 Lung Chun Road. Mei Hon Dentistry (美漢牙醫)", 1990–92
- "G/F, Chung Pak House, 80, Lung Chun Road. Koon Kau Shoes Fty. (貫球鞋廠)", 1992
- "Front Portion, 3/F, Chung Pak House, 80 Lung Chun Road. Yau Shing Brush Fty. (有成刷廠)"
- "Flat E. 3/F, 82 - 84 Lung Chu Road Kei Sik Shoes Processing Fty. (奇適鞋業加工廠)"

Counts in the titles (a simple word count, so the numbers are approximate):

- **Streets:** Tung Tau Tsuen Road (東頭村道) about 145, Lung Chun Road (龍津道) about 122, Lung
  Shing Road (龍城路) about 77, Kwong Ming Street (光明街) about 45, Sai Shing Road (西城路) about 35,
  Tai Chang Street (大井街) about 30, Lo Yan Street (老人街) about 24.
- **Floors:** G/F 314, M/F 13, 1/F 75, 2/F 46, 3/F 28, 4/F 17, 5/F 6, 6/F 12,
  7/F–12/F 11.
- **Trades:** factory ("Factory" or "Fty") about 163, dentistry about 61,
  plastics 48, clinic 38, metal 30, store 26, noodle 25, shoes 22, restaurant
  21, meat 16, garment 10, fish 9, roast meat 8.
- 102 titles are "[Ledger]" files for a business.

Most businesses were on the ground floor along the streets at the edge of the
city. Use the titles to place shops and workshops on the model. The streets
must match the street names on the base plan.

## HKRS1078-1: the clearance files

The 87 files of the City and New Territories Administration (政務總署) (Special Duties)
include:

- **Water and premises:** -50 "Supply of water to the Kowloon Walled City"
  (1987–92); -58 "Compensation - well-operaters" (1987–89); -59 non-domestic
  premises; -60 business loss; -73 food premises.
- **Doctors and dentists:** -17 to -22 working group on unregistered medical
  and dental practitioners (1987–92); -39 to -41 panel on clinics; -71, -72.
- **Residents:** -61 "Information pamphlets to residents"; -62 "Interviews and
  visits" (1987–92); -66 rehousing; -42 to -44 problem cases and overstayers.
- **Police:** -75 law and order; -76 to -78 monthly reports; -79 to -81
  monthly intelligence briefs (1987–92).
- **Groups:** -49, -51 to -55 voluntary agencies (St Stephen's Society 聖士提芬會 "The
  Well", Salvation Army 救世軍, Lutheran Hsin On Centre, CNEC 中華傳道會 Elderly, Federation of
  Youth Groups 香港青年協會); -67 Tin Hau Temple (天后廟); -82 to -85 landowners', kaifong and
  residents' associations.

## Other single files to ask for

| Ref | Title | Dates | Why |
|---|---|---|---|
| HKRS2298-1-171 | "Study on Qualified Area of Kowloon Wall City Structures" (HD 2400/14) | 1990–93 | Floor areas of the structures |
| HKRS2704-1-1 | "Lots within Kowloon Walled City" | 1987–91 | Lot records |
| HKRS163-1-3016 | "Electricity supply Kowloon Walled City" | 1963–64 | Power supply |
| HKRS163-9-502 | "New buildings in Kowloon Walled City" | 1968–75 | The tower boom |
| HKRS1375-1 | Urban Services Department (市政總署) hygiene files (confidential) | 1974–87 | Refuse, latrines, hygiene |
| HKRS439-11-1, -2 | "Demolition of Kowloon Walled City" | 1989–94 | Demolition |
| HKRS1149-1-2 | Town Planning Office, "Kowloon Walled City" | 1987–89 | Park planning |
| HKMS169-2-1 | James Hayes papers, "RAS visit to Kowloon Walled City, 6 May 1989" | 1983–89 | A first-hand visit |
| HKMS189-9-83 | Copy of UK file FCO 40/2476, "Future of Hong Kong: Kowloon Walled City" | 1988 | UK file |
| HKRS815-26-1456 | ArchSD (建築署) drawing: footpath widening, Carpenter Rd (賈炳達道) to First St, plan and section | | Edge of the city |
| HKRS815-26-1244 to -1246, -1350 | ArchSD drawings: playground, Hok Lo Street | | Edge of the city |
| HKRS1496-1-29 | RTHK (香港電台) 鏗鏘集 "城寨", episode 70 | 2 Dec 1979 | TV film. Scope note: "經常停水電, 污水, 垃圾問題". Copies need RTHK approval |
| HKRS1500-1-3 | RTHK Weekly Magazine, "九龍城寨", episode 1 | 23 Mar 1985 | TV film. Scope note: "城寨內的環境" |
| HKRS2292-1-10 | RTHK *All About Us*, episode 22, "Report on Kowloon Walled City" | 20 Dec 1988 | TV film |

## Room facts in `data/room_research.json` (2026-11-05)

- File titles of HKRS1255-3, HKRS1255-2, HKRS1078-1 and HKRS1077-2: G1–G190.
- 54 of these facts correct an entry of `data/businesses.json` (the field
  `corrects`). `grs_fixes` lists GRS premises that are the same room as
  another place, or are outside the period.

## More items: the source search of 2026-11 (catalogued, not read)

- **Status:** partly read: 1 of 26 items read by the reading of the source search of
  2026-11, and a checker checked a sample of the facts. Each other item is still catalogued, not
  read: its "What it gives" is the note of the finder, not a checked fact.

26 items. New HKRS files that the existing catalogue folder does not list.

### gap-daily-services-departments-12: ELECTRICITY SUPPLY TO SQUATTER AREA - POLICY FILE (HKRS413-4-13) and ELECTRICITY SUPPLY TO SQUATTER AREAS (POLICY) (HKRS413-4-14, HKRS413-4-15)

- **Creator:** Hong Kong Government, file ECDO 615 (vols. I-III); GRS series HKRS413 General Correspondence Files
- **Date:** 1969-10-15/1985-11-03
- **Kind:** document
- **Class:** primary (The government's policy file on power supply to squatter areas, kept at the time.)
- **Value:** high
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=pH8LEaaDEYk3bPRousU9Gw%3D%3D
- **Other links:** https://search.grs.gov.hk/en/arcview.xhtml?eid=0pOwk%2Bgd9BvQ43PGO%2FOM6Q%3D%3D, https://search.grs.gov.hk/en/arcview.xhtml?eid=ChSLpWKGDg4mU%2F6DniF%2FHw%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS413-4-15, original reference ECDO 615 III, 'ELECTRICITY SUPPLY TO SQUATTER AREAS (POLICY)', 4.9.1980 - 3.11.1985; HKRS413-4-13, original reference ECDO 615, 'ELECTRICITY SUPPLY TO SQUATTER AREA - POLICY FILE', 15.10.1969 - 10.10.1976
- **What it gives (finder's note, not checked):** Three volumes, 1969-1985, of the policy on legal power supply to squatter areas: -13 (1969-76), -14 (12.10.1976-1.8.1980), -15 (1980-85). These years cover the 1970s change from stolen power to a metered supply in the City that the repo's sources describe (INFERRED that the City is in the file).
- **Notes:** The repo holds HKRS163-1-3016 'Electricity supply Kowloon Walled City' (1963-64) only. A WebSearch extract gives, from a Hong Kong Heritage Project oral history of a CLP retiree, a 1970s 'squatter area supply scheme' (木屋區供電計劃) to stop power theft, with memories of the City: this file is the government side of that scheme (INFERRED). The meaning of 'ECDO' is not given in the record.

### gap-daily-services-departments-4: TUNG TAU TSUEN ROAD LATRINE AND BATHHOUSE REFURBISHMENT - WATER SUPPLY PLANS & DIAGRAMS (HKRS815-32-465), with - FLOOR PLANS AND ELEVATIONS (HKRS815-32-463) and - DRAINAGE PLANS AND DIAGRAMS (HKRS815-32-464)

- **Creator:** Architectural Office, Public Works Department / Architectural Services Department (建築署) record drawings; GRS series HKRS815
- **Date:** 1978-07-10/1983-05-30
- **Kind:** document
- **Class:** primary (Working drawings of a public latrine and bathhouse, made at the time of the works.)
- **Value:** high
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=kcwctSVaH6pEbYxBNo4nhg%3D%3D
- **Other links:** https://search.grs.gov.hk/en/arcview.xhtml?eid=V%2B%2FZVjFh%2BhXJf0p6a962ug%3D%3D, https://search.grs.gov.hk/en/arcview.xhtml?eid=gEv1xi0TNafIS8j6qHctpg%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS815-32-465, original reference 00066065-A/107086, 'TUNG TAU TSUEN ROAD LATRINE AND BATHHOUSE REFURBISHMENT - WATER SUPPLY PLANS & DIAGRAMS', 10.7.1978 - 30.5.1983, series 'MICROFILMING ON APERTURE CARDS FOR RECORD DRAWINGS OF GOVERNMENT BUILDINGS'
- **What it gives (finder's note, not checked):** Plans, elevations, drainage and water supply of the public latrine and bathhouse on Tung Tau Tsuen Road (東頭村道), refurbished between 1978 and 1983: the size and layout of a public toilet that served the north face of the City at its peak (the link to the City's residents is INFERRED from the road).
- **Notes:** Access through the Architectural Drawing Records Unit of ArchSD (tel. 2582 5262), under the Public Records (Access) Rules 1996. Not in the repo's GRS CSVs or the first-round files. The repo (docs/utilities.md) has the Tung Tsing Road Public Toilet and CoDR's latrines on Lung Chun Road, but not this one. The drawings do not say where on Tung Tau Tsuen Road the building stood. Found with the GRS query ("Tung Tau Tsuen Road" OR "Lung Chun Road") AND (school OR water OR fire OR refuse OR latrine OR standpipe).

### gap-crime-drugs-records-1: Kowloon City District Fight Crime Committee (HKRS767-1-9)

- **Creator:** Hong Kong Government (General Correspondence Files relating to Fight Crime Committees, series HKRS767); held by the Government Records Service (政府檔案處)
- **Date:** 1985-09-06/1988-01-14
- **Kind:** document
- **Class:** primary (The file of the district Fight Crime Committee (滅罪委員會) of Kowloon City, made at the time.)
- **Value:** high
- **Language:** en
- **Access:** offline
- **Licence:** Hong Kong Government records; Public Records (Access) Rules 1996
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=SbcgIdRwd9nZGKr2Q3gqMw%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+City%22+%22Fight+Crime%22
- **Proof that it exists:** GRS record: 'KOWLOON CITY DISTRICT FIGHT CRIME COMMITTEE', HKRS767-1-9, 6.9.1985 - 14.1.1988, File; original reference 'SF (3) TO SEC 10/3/32 II'.
- **What it gives (finder's note, not checked):** By its title and dates (INFERRED): the papers of the committee that dealt with crime in the district that held the City, from Sep 1985 to Jan 1988, thus over the model week of Dec 1986 and the clearance announcement of Jan 1987.
- **Notes:** Not in the repo's GRS catalogue (grs-catalogue-kwc/). The catalogue gives no scope note, so it is not confirmed that the file names the City. Physical file in the GRS Search Room (Kwun Tong). Other files of the same committee: HKRS767-1-8 (16.12.1983 - 12.8.1985, eid %2BRPo%2BSRDE061kVNKkK5GtQ%3D%3D), HKRS767-1-10 (11.1.1988 - 7.3.1989, eid O%2FrzXzNBQ9klCX0Gs%2FmeqA%3D%3D) and HKRS176-14-33 (15.9.1992 - 29.8.1996, eid SPZxMJ%2BxJFxNvVY3gFwmmA%3D%3D); see also candidate 2.

### blocked-b-9: SUPPLY OF WATER TO THE KOWLOON WALLED CITY (HKRS1078-1-50)

- **Creator:** Hong Kong Government (clearance records, series HKRS1078); Government Records Service
- **Date:** 1987-06-26 to 1992-01-11
- **Kind:** document
- **Class:** primary (A government file of the clearance period on the water supply of the City.)
- **Value:** high
- **Language:** en
- **Access:** print-only
- **Licence:** © Hong Kong Government; access under the Public Records (Access) Rules 1996
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=HKRS1078-1-50
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=HKRS2298-1-171, https://search.grs.gov.hk/en/search.xhtml?q=HKRS2704-1-1
- **Proof that it exists:** GRS search result: HKRS1078-1-50, "SUPPLY OF WATER TO THE KOWLOON WALLED CITY", 26.6.1987 - 11.1.1992.
- **What it gives (finder's note, not checked):** The water supply of the City from mid-1987 to the clearance. The two other files of the bullet: HKRS2298-1-171 'Study on Qualified Area of Kowloon Wall City Structures' (21.3.1990 - 25.2.1993), the floor areas of the structures; HKRS2704-1-1 'Lots within Kowloon Walled City' (22.1.1987 - 23.1.1991).
- **Notes:** All three catalogue records open (checked 2026-11-16). The files are not digitised: read them in the GRS Search Room. The repo's grs-catalogue-kwc already lists them. The three are separate files and can be cited one by one.

### gap-builders-demolition-park-29: GRS search results for "Control of Obstructions" (19 files, 1957-2005), with HKRS924-1-5 'HONG KONG AIRPORT (CONTROL OF OBSTRUCTIONS) ORDINANCE ENFORCEMENT OF' and HKRS773-1-65 'H.K. AIRPORT (CONTROL OF OBSTRUCTIONS) (AMENDMENT) BILL/ ORDINANCE 1974'

- **Creator:** Hong Kong Government; catalogue of the Government Records Service (政府檔案處)
- **Date:** 1957/2005
- **Kind:** catalogue
- **Class:** primary (Government files of the time on the airport height law that the high-rise blocks of the City broke.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** catalogue data © HKSAR Government
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=%22Control+of+Obstructions%22
- **Other links:** https://search.grs.gov.hk/en/arcview.xhtml?eid=2xHaivpBPpt%2Fd14tA7zuRA%3D%3D, https://search.grs.gov.hk/en/arcview.xhtml?eid=MF%2F%2FAHsljA46tnKYHsl00A%3D%3D, https://search.grs.gov.hk/en/arcview.xhtml?eid=N8fj%2FvyOYMwb%2FG5GtfHOhQ%3D%3D
- **Proof that it exists:** GRS search: 19 results. HKRS924-1-5, 28.4.1977 - 10.4.1978, original ref RV 6/1/1 PC; HKRS773-1-65, 30.4.1973 - 27.7.1982, original ref SBCR 18/3231/80.
- **What it gives (finder's note, not checked):** The files on the Kai Tak height law. HKRS924-1-5 covers its enforcement in 1977-78, the years of FCO 40/790 and 40/980. HKRS773-1-65 (series 'Files Relating to General Defence and Security Matters (Confidential)') covers the 1974 amendment. HKRS1631-2-1 and HKRS1631-2-162 cover the Control of Heights Order of 1957 and its compensation.
- **Notes:** No title names the City: the link to the City is INFERRED from the dates and from the FCO files. The repo's GRS export (search 'Kowloon Walled City') does not list these files. HKRS46-1-227 (1957-58, compensation tribunal rules) has a digitised PDF (Part01). Search extracts of FCO 40/790 (blocked) say that the developers complied with the closure orders 'on a voluntary basis' in an operation in July 1975, and that the number of over-height buildings was 'frozen' from September 1976.

### gap-daily-services-departments-6: LATRINES & BATHHOUSES IN AREA NORTH OF CARPENTER ROAD, KOWLOON CITY (HKRS156-1-7078)

- **Creator:** Hong Kong Government, Buildings and Lands file (original reference BL8/4021/59); GRS series HKRS156 General Correspondence Files
- **Date:** 1959-02-13/1960-12-12
- **Kind:** document
- **Class:** primary (A government working file of the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=kacEwaH%2F7n1lrAkg4a5f2Q%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22north+of+Carpenter+Road%22
- **Proof that it exists:** GRS record: Reference HKRS156-1-7078, original reference BL8/4021/59, 'LATRINES & BATHHOUSES IN AREA NORTH OF CARPENTER ROAD, KOWLOON CITY', 13.2.1959 - 12.12.1960
- **What it gives (finder's note, not checked):** The government's plan for public latrines and bathhouses in the area north of Carpenter Road (賈炳達道), that is, on the City's side of the road, in 1959-60: the start of the public toilets around the City.
- **Notes:** Earlier history (before 1975). That 'area north of Carpenter Road' includes the City is INFERRED: the GRS also uses the phrase for No. 34 Hok Lo Street (HKRS156-2-3767, 1969-70) at the City's south-west edge. A GRS search for "north of Carpenter Road" gives 6 files; candidates 7 and 8 are two more of them.

### gap-daily-services-departments-7: SMALL LATRINES IN THE AREA NORTH OF CARPENTER ROAD CONSTRUCTION OF - (HKRS156-1-7079)

- **Creator:** Hong Kong Government, Buildings and Lands file (original reference BL1/8/4021/59); GRS series HKRS156
- **Date:** 1959-09-22/1963-08-12
- **Kind:** document
- **Class:** primary (A government working file of the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=jUOR85%2FmLJJG8Mwy0YXu5w%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS156-1-7079, original reference BL1/8/4021/59, 'SMALL LATRINES IN THE AREA NORTH OF CARPENTER ROAD CONSTRUCTION OF -', 22.9.1959 - 12.8.1963
- **What it gives (finder's note, not checked):** The building of small latrines in the area north of Carpenter Road, 1959-63, a sub-file of candidate 6 (same file number 4021/59): where and how many small latrines were put in, in or next to the City (INFERRED).
- **Notes:** Earlier history. The repo's 1974 Lords debate (uk-lords-hansard-1974) speaks of latrines; this file can date them.

### citations-11: A Short Study on Multi Storey Buildings in and Around the Walled City

- **Creator:** City District Officer (Kowloon City), Hong Kong Government (confidential report)
- **Date:** 1972-11-07
- **Kind:** document
- **Class:** primary (An official study of the first high-rise buildings, written at the time by the district office.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** unknown (HK Government record)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=tC2zpwp94j7vixITnS8nUg%3D%3D
- **Other links:** https://doi.org/10.1016/j.landusepol.2015.09.016
- **Proof that it exists:** GRS record HKRS163-9-233, "KOWLOON WALL CITY. IMPLEMENTATION OF AD HOC COMMITTEE. REPORT OF ...", 9.5.1972 - 1.2.1973, original reference CR5/3371/60 VII
- **What it gives (finder's note, not checked):** By its title, the multi-storey buildings in and around the City in 1972, when the high-rise building started.
- **Notes:** Cited by Lai et al. 2016 (Crossref) as "7.11.1972; CR5/3371/60 Pt VII". The GRS record of HKRS163-9-233 has the original reference CR5/3371/60 VII and dates that include 7 Nov 1972. The repo's GRS catalogue lists the file, but not this report. The same paper cites two more documents: a Defence Branch paper of 1972 for the Governor's Committee, "Multi-storey buildings on the Periphery of the Kowloon Walled City", and a Colonial Secretariat memo of 19.08.69, "Kowloon Walled City and Adjoining Areas" (Temp SCR 31/69).

### top-citations-2: Construction in Walled City

- **Creator:** Royal Hong Kong Police (a detective sergeant's reports for the City District Office, Kowloon City)
- **Date:** 1975
- **Kind:** document
- **Class:** primary (Police reports made in 1975 from site visits to each building under construction.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (Crown copyright at the time)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=RjFZ0dBH7jubFmXTy6l4mw%3D%3D
- **Other links:** https://doi.org/10.3390/buildings12060757, https://mdpi-res.com/d_attachment/buildings/buildings-12-00757/article_deploy/buildings-12-00757.pdf
- **Proof that it exists:** GRS record: HKRS396-1-4, 'DEVELOPMENT OF BUILDINGS - KOWLOON WALLED CITY', original reference K/KC/CON 262/3 II, 2.1.1973 - 6.1.1976, File
- **What it gives (finder's note, not checked):** For each building in 1975: site serial number, house number, street, original number of storeys and storeys rebuilt. From these reports Chua and Yau count 41 buildings on 10 streets that were raised in 1975, by 347 storeys in all (196 on Lung Chun Road). Single reports give the deals: the owner of 24 Tung Tau Tsuen Road got HK$600,000 and the ground and first floors of the new building; a flat at 19 Shung Yee Lane sold for about HK$26,000 (report of 12 December 1975).
- **Notes:** Lai 2024 (Land 13:2112, p. 9) describes the series: a typewritten 'diary' with the subject 'Construction in Walled City', with reports for January, April, May and July to December 1975. Chua and Yau, Buildings 12 (2022): 757, cite items No. 1, 10, 43, 89 and 179 of the file and give Table 2 (storeys by street) and a 1975 report map (Figure 5); I read the full text (pdftotext). Enclosure 104 of the same file: the Buildings Ordinance Office asks for the removal of the roof water tank and the top 1.5 floors of 19 Shung Yee Lane. This is a different document from citations-10 (the CDO paper of 16.10.75 in the same file). Chua and Yau write the street names 'Tai Cheng Street', 'Tung Tau Chuen Road' and 'Tau Tung Tsuen Road'. Their Table 3 (ten developers) comes from the 1972 CDO study (citations-11).
- **Same item in the finder files:** citations-10

### gap-daily-services-departments-13: ELECTRICITY SUPPLY IN SQUATTER AREAS (HKRS276-7-204)

- **Creator:** Economic (Services) Branch, Government Secretariat; original reference ECON 2/2061/75; GRS series HKRS276
- **Date:** 1975-06-04/1978-11-29
- **Kind:** document
- **Class:** primary (The branch's working file of the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=Q0AggwezmuFicbCanIOqew%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%28electricity+OR+%22China+Light%22%29+AND+%28squatter+OR+squatters+OR+%22Kowloon+City%22%29
- **Proof that it exists:** GRS record: Reference HKRS276-7-204, original reference ECON 2/2061/75, 'ELECTRICITY SUPPLY IN SQUATTER AREAS', 4.6.1975 - 29.11.1978, series 'Files Relating to Business and Administration of the Economic (Services) Branch'
- **What it gives (finder's note, not checked):** The Secretariat branch that dealt with the power companies, on power supply to squatter areas in 1975-78, the years of the 1977 fire and the supply plan for the City (INFERRED that the City is in the file).
- **Notes:** Another file of the same title is HKRS337-4-7140, 17.8.1974 - 7.1.1976 (eid MsDlZZCJ63j4YehCCy%2Fcfg%3D%3D), not opened. The same GRS search has general CLP press files HKRS70-2-363 and HKRS70-6-535 (1966-75), not checked for the City.

### gap-daily-services-departments-11: TEMPORARY ARRANGEMENT FOR ADDITIONAL STANDPIPES IN SQUATTER AREAS (WATER RESTRICTION 81) (HKRS287-3-4)

- **Creator:** Waterworks Office of the Public Works Department and its successor (Water Supplies Department, 水務署); original reference W.W.O. 10/4602/81
- **Date:** 1981-10-12/1982-02-26
- **Kind:** document
- **Class:** primary (The water authority's own working file of the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=ctWugRXrbn%2B1Yb0QhCSfaA%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%28standpipe+OR+standpipes%29+AND+%28squatter+OR+squatters+OR+Kowloon%29
- **Proof that it exists:** GRS record: Reference HKRS287-3-4, original reference W.W.O. 10/4602/81, 'TEMPORARY ARRANGEMENT FOR ADDITIONAL STANDPIPES IN SQUATTER AREAS (WATER RESTRICTION 81)', 12.10.1981 - 26.2.1982, series HKRS287 'Files Relating to General Business of the Waterworks Office of the Public Works Department and its Successor'
- **What it gives (finder's note, not checked):** The extra standpipes put in squatter areas during the water restriction of 1981-82 (restrictions from Oct 1981 to 1 Jun 1982, per a government yearbook quoted on Gwulo): it can say whether the City, which drew water from standpipes and illegal mains taps, got extra standpipes (INFERRED; contents not seen).
- **Notes:** The first water file of the water authority's own series that I found; the repo holds HKRS1078-1-50 (1987-92) from the clearance series. The same series has HKRS287-1-349 (standpipes in the 1963 emergency) and HKRS287-1-375 (public flushing standpipes, 1967), both earlier. Whether 'squatter areas' covers the City is INFERRED.

### blocked-c-27: Hsin On Centre of the Hong Kong and Macau Lutheran Church

- **Status:** Partly read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20. I read the GRS catalogue entry (it opens without a login). The file itself is on paper at the Public Records Office; the page offers only 'Reserve' and 'Access Application', with no digital copy. Thus I could not read the file. The repo already holds this entry as row HKRS1078-1-53 of primary-sources/grs-catalogue-kwc/grs-hkrs1078-1.csv.
- **Citation:** Hong Kong Government, 'HSIN ON CENTRE OF THE HONG KONG AND MACAU LUTHERAN CHURCH', file, 21.5.1987 - 2.10.1992, original reference CNTA/SD/CON/2/11, Public Records Office, Government Records Service, HKRS1078-1-53 (series HKRS1078, Records relating to clearance of the Kowloon Walled City (confidential)). Catalogue entry: https://search.grs.gov.hk/en/arcview.xhtml?eid=Kt4AVzZhTddf1jxuRF2XuQ%3D%3D
- **Class:** primary (A government file of the clearance years (1987-1992), not seen. The catalogue entry is a finding aid.)
- **Date of the record:** 1987-05-21 to 1992-10-02 (dates of the file)
- **Note:** the reader classed the whole item as primary: its 5 facts are in the secondary twin, [`../../secondary-sources/grs-catalogue-kwc/SOURCE.md`](../../secondary-sources/grs-catalogue-kwc/SOURCE.md).

- **Leads:**
  - The file HKRS1078-1-53 itself (21.5.1987 - 2.10.1992) at the Public Records Office, Hong Kong: needs an Access Application and a visit in person.
### top-blocked-b-9: FINANCE COMMITTEE - D (HKRS70-9-419)

- **Creator:** Government Information Services, Press Library (HKRS70 Press Library Files)
- **Date:** 1987-10/1987-12
- **Kind:** catalogue
- **Class:** primary (A file of press cuttings collected by the government at the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** unknown (GRS catalogue record)
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=HKRS70-9-419
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22Finance+Committee%22+%22Walled+City%22
- **Proof that it exists:** GRS search result: "HKRS70-9-419", "FINANCE COMMITTEE - D", "10.1987 - 12.1987", level File, series "HKRS70 Press Library Files".
- **What it gives (finder's note, not checked):** Press cuttings on the LegCo Finance Committee for October-December 1987. A search extract of FCO 40/2214 p.148 says that the compensation and rehousing package for the Walled City clearance went to the Finance Committee 'on 9 December' 1987, thus this file can hold the press reports of that meeting (INFERRED).
- **Notes:** Lead for the README bullet 'LegCo Finance Committee paper of 9 Dec 1987', which is still not found online (legco.gov.hk: certificate error). Not digitised: read it in the GRS Search Room. Related files from the same search: HKRS70-9-417 'FINANCE COMMITTEE - N' (1986-1987) and HKRS70-9-418 'FINANCE COMMITTEE - D' (3.1987-4.1987). The repo's GRS csv does not list HKRS70-9-417 to 419.

### gap-daily-services-departments-14: WALLED CITIES - KLN WALLED CITY, 04.1989 - 1995 - D (HKRS70-13-89)

- **Creator:** Government Information Services, Press Library; GRS series HKRS70 Press Library Files
- **Date:** 1989-04-04/1995-09-06
- **Kind:** press
- **Class:** primary (A press-cutting file kept at the time by the government's press office.)
- **Value:** medium
- **Language:** other
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only); cuttings © the newspapers
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=Si4GNzFwJ5RLvQioyiZhgg%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22Walled+City%22+NOT+Kowloon
- **Proof that it exists:** GRS record: Reference HKRS70-13-89, 'WALLED CITIES - KLN WALLED CITY, 04.1989 - 1995 - D', 4.4.1989 - 6.9.1995, series 'Press Library Files (Series HKRS70)'
- **What it gives (finder's note, not checked):** Press cuttings on the City from April 1989 to 1995: the clearance, evictions, demolition and park years. It continues HKRS70-13-90 (1984 - 03.1989, 'D+N'), which the repo holds; its title says 'KLN', thus the repo's "Kowloon Walled City" search missed it.
- **Notes:** The meaning of the suffixes D, N and E is not given in the record (D can be Chinese dailies, E English: INFERRED). Found with "Walled City" NOT Kowloon (8 hits), which also gives HKRS70-8-5039 and -5040 (candidate 15).

### gap-crime-drugs-records-2: Kowloon City District Fight Crime Committee (HKRS767-2-7)

- **Creator:** Hong Kong Government (series HKRS767); held by the Government Records Service
- **Date:** 1989-04-28/1992-07-07
- **Kind:** document
- **Class:** primary (The district crime committee's file, made at the time of the clearance.)
- **Value:** medium
- **Language:** en
- **Access:** offline
- **Licence:** Hong Kong Government records; Public Records (Access) Rules 1996
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+City%22+%22Fight+Crime%22
- **Proof that it exists:** GRS search list: 'KOWLOON CITY DISTRICT FIGHT CRIME COMMITTEE', HKRS767-2-7, 28.4.1989 - 7.7.1992, File (eid 7LJZG7pXzDAuVwwkehmsTg%3D%3D).
- **What it gives (finder's note, not checked):** By its title and dates (INFERRED): district crime business during the clearance years, 1989 to Jul 1992, when the last residents left the City.
- **Notes:** Seen in the GRS search list only; the arcview record of this file was not opened. Its arcview URL is https://search.grs.gov.hk/en/arcview.xhtml?eid=7LJZG7pXzDAuVwwkehmsTg%3D%3D (INFERRED from the eid of the list; not opened). Not in the repo's GRS catalogue.

### top-citations-1: Departmental Activity in the Walled City

- **Creator:** Hong Kong Government, Colonial Secretariat (a summary from each department, attached to a directive after the Governor's Committee)
- **Date:** c.1973
- **Kind:** document
- **Class:** primary (The government departments that served the City made this summary at the time.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (Crown copyright at the time)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=DJ6RZEB%2BmH7T6rqUcZJLcA%3D%3D
- **Other links:** https://doi.org/10.3390/land13122112, https://mdpi-res.com/d_attachment/land/land-13-02112/article_deploy/land-13-02112.pdf
- **Proof that it exists:** GRS record: HKRS163-9-234, 'KOWLOON WALL CITY. IMPLEMENTATION OF AD HOC COMMITTEE. REPORT OF ...', original reference CR5/3371/60 VIII, 8.1.1973 - 6.11.1973, File
- **What it gives (finder's note, not checked):** Department by department, what the government did in the City: police, fire, Urban Services (daily refuse and night-soil collection, public latrines, daily chlorination of wells), Labour (factory inspections every 6-12 months), Education (about 2,100 children in seven schools, 1,300 of them in the two Communist schools), Buildings (563 buildings, 259 of four storeys or more), water from standpipes outside the boundary, from wells and from illegal connections, 24 medical and 64 dental clinics (only the Project Concern clinic registered). It also gives the census count of 9 March 1971 (10,004 persons, 2,185 living quarters, 2,165 householders), the CDO estimate of about 27,000 persons, social welfare cases and six voluntary agencies.
- **Notes:** Enclosure 85 in Part VIII of the Ad Hoc Committee File (CR5/3371/60). Lai, 'Kowloon Walled City: A Case of Land Administration of a Disputed Territory', Land 13 (2024): 2112, reference 26, quotes it as Table 1 (pp. 10-12), which I read in the full text (pdftotext). Lai says that the entries are 'extracts, touched up'. Date conflict: Lai dates the Governor's directive 'July 1975' ('At the Governor's Committee on 13th July ...'), but the GRS dates of HKRS163-9-234 end on 6.11.1973. INFERRED: the directive is of July 1973, because the 563-building count is also in the 1972 CDO study (citations-11). The same table names a Government House meeting of December 1969 (Item 566/69): no direct action against the schools. The repo GRS catalogue lists the file, not this document. Physical only, at the GRS search room.

### gap-daily-services-departments-9: PROPOSED PUBLIC LATRINE - CARPENTER ROAD, KOWLOON CITY, H.K. / SITE PLAN, GROUND FLOOR PLAN FIRST FLOOR PLAN (HKRS815-24-1291), with LATRINE CARPENTER ROAD, KOWLOON CITY (HKRS815-19-416 to -419, HKRS815-29-1651) and LATRINE AT CARPENTER ROAD KOWLOON CITY (HKRS819-5-2094)

- **Creator:** Public Works Department / Architectural Services Department record drawings; GRS series HKRS815 and HKRS819
- **Date:** undated
- **Kind:** document
- **Class:** primary (Record drawings of a public latrine, made by the works office.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=hr8zql46z2PJNdAyVSaLXw%3D%3D
- **Other links:** https://search.grs.gov.hk/en/arcview.xhtml?eid=BvDpJA9S%2Bziw1DKQUsrMkw%3D%3D, https://search.grs.gov.hk/en/arcview.xhtml?eid=OdkmSLWQipsRb5JHlgqSFw%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS815-24-1291, original reference 00049291-A P/364, 'PROPOSED PUBLIC LATRINE - CARPENTER ROAD, KOWLOON CITY, H.K. / SITE PLAN, GROUND FLOOR PLAN FIRST FLOOR PLAN'
- **What it gives (finder's note, not checked):** Drawings of the public latrine on Carpenter Road, on the south side of the City: site plan, floor plans, elevations, sections, 'plan of existing site' (-418) and a proposed store (-1651). It can place a public toilet that the City's residents used (INFERRED).
- **Notes:** No covering dates in the catalogue. HKRS819-5-2094 joins it with a latrine at Warren Street, Tai Hang, in one title. Carpenter Road Park (built from 1983) later took the strip; the new park toilets of 2004 (HKRS819-32-1758 to -1764) are after the period.

### gap-daily-services-departments-10: CARPENTER ROAD BATH HOUSE EXTENSION / SITE PLAN, WATER SUPPLY, ELECTRICAL POINT, DETAIL OF BOILER ROOM (HKRS815-17-224)

- **Creator:** Public Works Department / Architectural Services Department record drawings; GRS series HKRS815
- **Date:** undated
- **Kind:** document
- **Class:** primary (A record drawing of the works, made by the works office.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=w%2Fl2LkI3uTtXNv66eGEkJA%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS815-17-224, original reference 00034224-A1029/1, 'CARPENTER ROAD BATH HOUSE EXTENSION / SITE PLAN, WATER SUPPLY, ELECTRICAL POINT, DETAIL OF BOILER ROOM'
- **What it gives (finder's note, not checked):** A public bath house on Carpenter Road, with a boiler room (thus hot water), its water supply and its power point: a place where people from the south side of the City could bathe (INFERRED).
- **Notes:** No date in the catalogue. Deposit HKRS815-17 holds older drawings than HKRS815-30 to -33, thus probably 1960s (INFERRED).

### gap-daily-services-departments-5: STANDARD 45 SEATER LATRINE & 33 SHOWER STALL BATH HOUSE - TUNG TAU TSUEN ROAD KOWLOON (HKRS815-30-784, HKRS815-30-1406 to -1410)

- **Creator:** Public Works Department / Architectural Services Department record drawings; GRS series HKRS815
- **Date:** undated (before 1978)
- **Kind:** document
- **Class:** primary (Record drawings of the building, made by the works office at the time it was built.)
- **Value:** medium
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=Fz7rRCSW9FY3JnsGQyra4g%3D%3D
- **Other links:** https://search.grs.gov.hk/en/arcview.xhtml?eid=RKYtEpXIZv9shwT%2FUiUogA%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS815-30-1409, original reference 00061424-A/14942, 'STANDARD 45 SEATER LATRINE & 33 SHOWER STALL BATH HOUSE - TUNG TAU TSUEN ROAD KOWLOON / PLAN & DETAIL'
- **What it gives (finder's note, not checked):** The original design of the same Tung Tau Tsuen Road block: 45 latrine seats and 33 shower stalls, with site layout (-784), lower ground (-1406), drainage (-1407), details (-1408), plan and detail (-1409) and one more sheet (-1410). A count of public toilets and showers next to the City (INFERRED that City residents used it).
- **Notes:** No covering date in the catalogue; the refurbishment of 1978-83 (candidate 4) shows it existed by 1978. That this is the same building as candidate 4 is INFERRED (same road, same use).

### gap-daily-services-departments-16: N.K.I.L. NO. 3525 - 1. APPLICATION FROM THE LOK SIN TONG FOR THE GRANT OF AN AREA AT THE JUNCTION OF LUNG KONG ROAD AND CARPENTER ROAD, KOWLOON CITY, FOR THE BUILDING OF A FREE SCHOOL 2. EXTENSION TO - (HKRS156-1-890)

- **Creator:** Hong Kong Government, Buildings and Lands file (original reference BL36/3091/47); GRS series HKRS156
- **Date:** 1947-01-03/1969-12-29
- **Kind:** document
- **Class:** primary (A government land file of the time.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=kNzwLyHZQbYM5EQisseAvg%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS156-1-890, original reference BL36/3091/47, 'N.K.I.L. NO. 3525 - 1. APPLICATION FROM THE LOK SIN TONG FOR THE GRANT OF AN AREA AT THE JUNCTION OF LUNG KONG ROAD AND CARPENTER ROAD, KOWLOON CITY, FOR THE BUILDING OF A FREE SCHOOL 2. EXTENSION TO -', 3.1.1947 - 29.12.1969
- **What it gives (finder's note, not checked):** The site, lot and extensions (1947-69) of the Lok Sin Tong free school at Lung Kong Road and Carpenter Road, just south-west of the City. A school that the City's children attended (INFERRED from a search extract, see notes).
- **Notes:** Outside the City and before 1975. A WebSearch extract of The News Lens article 98486 (blocked; README lead) says the writer went to 樂善堂小學 on 龍崗道 and that half his classmates lived in the City; I did not read the article. This is not the Free School (義學) inside the City of docs/structure.md.

### gap-daily-services-departments-8: DRAINAGE IN AREA NORTH OF CARPENTER ROAD, KOWLOON CITY (HKRS156-1-7084)

- **Creator:** Hong Kong Government, Buildings and Lands file (original reference BL1/4596/59); GRS series HKRS156
- **Date:** 1959-05-16/1959-06-30
- **Kind:** document
- **Class:** primary (A government working file of the time.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=hqaYZPTE3rThlbW%2FADcc3w%3D%3D
- **Proof that it exists:** GRS record: Reference HKRS156-1-7084, original reference BL1/4596/59, 'DRAINAGE IN AREA NORTH OF CARPENTER ROAD, KOWLOON CITY', 16.5.1959 - 30.6.1959
- **What it gives (finder's note, not checked):** A short 1959 file on the drains of the area north of Carpenter Road: the state of the drains in or next to the City before the tower boom (INFERRED).
- **Notes:** Earlier history; only six weeks of papers.

### top-citations-5: POK OI VILLAGE RESIDENTS' FELLOWSHIP ASSOCIATION, KOWLOON

- **Creator:** Hong Kong Government, Registrar of Societies (case file, HKRS590-4)
- **Date:** 1959-1992
- **Kind:** document
- **Class:** primary (A government case file kept from 1959 to 1992.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (Crown copyright at the time)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=W8hvycruYzVzuX3leToCBw%3D%3D
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22Pok+Oi+Village%22
- **Proof that it exists:** GRS record: HKRS590-4-148, 'POK OI VILLAGE RESIDENTS' FELLOWSHIP ASSOCIATION, KOWLOON', original reference CP/SR/19/1821, 29.1.1959 - 18.9.1992, 'Case Files Relating to De-registered and Unsuccessfully-registered Societies'
- **What it gives (finder's note, not checked):** By its series, the registration of the residents' association of Pok Oi Village, the squatter village on the hill beside the City, and its end. The dates reach the clearance (1992). Content not seen.
- **Notes:** Found from a citation: Lai, Chua and Ching, 'Rational development under uncertain de facto jurisdictional boundaries', Land Use Policy 68 (2017), cites 'Resettlement Department, 1966. Pok Oi Village Residents Fellowship Association, File RD 7/131/64' (Crossref reference list). A GRS search for 'Pok Oi Village' gives 4 files: HKRS524-3-8 (1959-1971; citations-19 names it in its notes), HKRS590-4-148 (this file), HKRS163-9-654 ('... CLAIMS FROM ... FOR COMPENSATION', 1970-1972) and HKRS2348-2-2 (school registration cards). INFERRED: RD 7/131/64 is HKRS524-3-8. The same paper cites 'Secretary for Chinese Affairs, 1962, Confidential File CR6/5282/63' with no title. Requires a PRO undertaking.

### top-citations-3: [Minute 27, 18 June 1964: refusal of a piped water supply to the Walled City, after a request of the Kaifong association]

- **Creator:** Colonial Secretariat, Hong Kong Government
- **Date:** 1964-06-18
- **Kind:** document
- **Class:** primary (A government minute written at the time of the decision.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (Crown copyright at the time)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=hc%2FkrzUUaAI3uqEhDalmyA%3D%3D
- **Other links:** https://doi.org/10.3390/land13122112
- **Proof that it exists:** GRS record: HKRS163-1-2536, 'KOWLOON WALLED CITY - IMPLEMENTATION OF REPORT OF AD HOC COMMITTEE.', original reference 5/3371/60 PART III, 23.1.1963 - 6.2.1965, File
- **What it gives (finder's note, not checked):** The government refused a door-to-door piped water supply to the City's buildings. The Medical and Health Department and the Urban Services Department had said that the high-rise buildings used polluted artesian water. The reason given: the Kaifong association could make 'political capital' out of it. This explains the standpipes outside the boundary that served the City to the clearance.
- **Notes:** Cited by Lai 2024 (Land 13:2112, p. 13, reference 24). The title is my description: the source gives no title. Other documents of the same file that Lai cites: Enclosure 35, a police house-to-house survey of the City in April 1960 (a lead for the population and buildings of 1960); Minute 13 (July 1963), on orders under the Buildings Ordinance against buildings that obstruct civil aviation. Physical only, at the GRS search room.

### maps-25: AIRCRAFT NOISE SURVEY (HKRS1820-2-75), with SURVEY ON AIRCRAFT NOISE (HKRS532-5-177) and AIRCRAFT NOISE AND NIGHT FLYING (HKRS934-12-51)

- **Creator:** Hong Kong Government (HKRS1820: Educational Research, Testing and Guidance Service files)
- **Date:** 1974-01 to 1983-05
- **Kind:** document
- **Class:** primary (Government files made at the time on the noise of Kai Tak aircraft.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © Hong Kong Government (GRS access rules)
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=HKRS1820-2-75
- **Other links:** https://search.grs.gov.hk/en/search.xhtml?q=%22aircraft+noise%22+Kowloon
- **Proof that it exists:** GRS record HKRS1820-2-75 "AIRCRAFT NOISE SURVEY", 1.3.1977 - 23.3.1982, series "HKRS1820 Files Relating to Educational Research, Testing and Guidance Service"
- **What it gives (finder's note, not checked):** Three files on aircraft noise: a survey of 21-29 January 1974, a survey file of 1977-1982 in an education research series, and a file on aircraft noise and night flying of 1973-1983. They can hold noise maps of the approach over Kowloon City, and the noise in its schools (INFERRED from the titles).
- **Notes:** Titles only; I did not read the contents. A GRS search for "noise contour" gave 0 results. HKRS934 is a confidential local administration series. Kai Tak approach charts (IGS runway 13) were not found: one search gave only simulator and forum copies, and the web search budget then ran out.

### gap-daily-services-departments-15: WALLED CITIES - GENERAL - E (HKRS70-8-5039) and WALLED CITIES - (GENERAL) - N (HKRS70-8-5040)

- **Creator:** Government Information Services, Press Library; GRS series HKRS70
- **Date:** 1980/1983
- **Kind:** press
- **Class:** primary (Press-cutting files kept at the time.)
- **Value:** low
- **Language:** other
- **Access:** print-only
- **Licence:** © HKSAR Government (catalogue data only); cuttings © the newspapers
- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=%22Walled+City%22+NOT+Kowloon
- **Proof that it exists:** GRS search page: 'HKRS70-8-5039 | WALLED CITIES - GENERAL - E | 1980 - 1983' and 'HKRS70-8-5040 | WALLED CITIES - (GENERAL) - N | 1980 - 1983'
- **What it gives (finder's note, not checked):** General press cuttings on walled cities, 1980-83, beside the City-specific files HKRS70-8-5041 to -5044 that the repo holds. They can hold cuttings on the City that were filed as general (INFERRED); they can also be only about walled villages such as Kam Tin.
- **Notes:** eids: z9q%2FmfrxLEV2scBsK%2BUQAw%3D%3D (-5039), qB0rqbgfd1NMP5PqHun4YQ%3D%3D (-5040). Arcview pages not opened.

### top-citations-4: [Plan with 'the boundary of the original Walled City ... as can be ascertained from the record plans available', on 1:600 survey sheet 130-NW-1, with a memorandum of the Superintendent of Crown Land]

- **Creator:** Superintendent of Crown Land, Public Works Department, Hong Kong
- **Date:** c.1963-1965
- **Kind:** map
- **Class:** primary (A government survey plan, certified at the time for official use.)
- **Value:** low
- **Language:** en
- **Access:** print-only
- **Licence:** © HKSAR Government (Crown copyright at the time)
- **Link:** https://search.grs.gov.hk/en/arcview.xhtml?eid=hc%2FkrzUUaAI3uqEhDalmyA%3D%3D
- **Other links:** https://doi.org/10.3390/land13122112, https://mdpi-res.com/d_attachment/land/land-13-02112/article_deploy/land-13-02112.pdf
- **Proof that it exists:** GRS record: HKRS163-1-2536, 'KOWLOON WALLED CITY - IMPLEMENTATION OF REPORT OF AD HOC COMMITTEE.', 23.1.1963 - 6.2.1965
- **What it gives (finder's note, not checked):** The line of the old City walls in red on a 1:600 plan of the interior, which the government used for the 'Nunnery Site' scheme. The red label is 'Kowloon City'. The line follows the old walls, but it leaves out the Pak Hok Shan part of the City.
- **Notes:** Enclosure 84 of Part III of the Ad Hoc Committee File. Lai 2024 (Land 13:2112, p. 8) reproduces it as Figure 1. Lai writes the sheet number as '130-NW-1'. The README gives the 1:600 sheet of the City as 180-NW-1: INFERRED, '130' is a misprint for '180'. Lai also says that the 1905 Survey District 1 map and later plans show the City surveyed again to about 1970. Physical only, at the GRS search room.
