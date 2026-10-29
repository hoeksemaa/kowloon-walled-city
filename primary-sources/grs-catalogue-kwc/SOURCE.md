# HK Government Records Service (GRS): catalogue of Walled City records, 1963–1997

The GRS (the Public Records Office of Hong Kong) holds the government's own
files on the Walled City. These cover the clearance committees, the
compensation case for each business, police reports, water supply, and
unregistered doctors and dentists. Many file titles give an address, a floor,
a business name and a trade.

- **Link:** https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+Walled+City%22
- **Retrieved:** 2026-10-29, from the free online catalogue.
- **Access to the files:** you can read them only in the GRS Search Room, 2/F
  Hong Kong Public Records Building, 13 Tsui Ping Road, Kwun Tong. Access is
  under the "Public Records (Access) Rules 1996". The catalogue does not say
  which files are open.
- **Copyright:** HKSAR Government. The CSV files in this folder are catalogue
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
| `grs-hkrs1255-3.csv` | 692 | HKRS1255-3: case files for business claimants, 1984–1997, from the Lands Department (Acquisition) | `82cb1732476ce246f50a9206d80956ed371f5cc7167878378cdc9363d052af9a` |
| `grs-hkrs1255-2.csv` | 129 | HKRS1255-2: case files for claimants, 1987–1998, from the Lands Department (Legal Advisory and Conveyancing Office) | `7f9e04b8ee704459596c0256a466bd8824765ec9329fab05c11c0c61d06ce551` |
| `grs-hkrs1078-1.csv` | 87 | HKRS1078-1: confidential clearance files, 1987–1993 | `19ddd499c5d4a6d421b1164362a025623fbe136c8f8622375cf6c130bb3c63ed` |
| `grs-hkrs1077.csv` | 17 | HKRS1077-1, -2, -3: Home Affairs Department, Clearance Appeals Section, 1900–2001 | `494ef78c0fab0da4cfb98c9945364335d67bbb3617d53ee8a8d003879619e03a` |
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

- **Streets:** Tung Tau Tsuen Road about 145, Lung Chun Road about 122, Lung
  Shing Road about 77, Kwong Ming Street about 45, Sai Shing Road about 35,
  Tai Chang Street about 30, Lo Yan Street about 24.
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

The 87 files of the City and New Territories Administration (Special Duties)
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
- **Groups:** -49, -51 to -55 voluntary agencies (St Stephen's Society "The
  Well", Salvation Army, Lutheran Hsin On Centre, CNEC Elderly, Federation of
  Youth Groups); -67 Tin Hau Temple; -82 to -85 landowners', kaifong and
  residents' associations.

## Other single files to ask for

| Ref | Title | Dates | Why |
|---|---|---|---|
| HKRS2298-1-171 | "Study on Qualified Area of Kowloon Wall City Structures" (HD 2400/14) | 1990–93 | Floor areas of the structures |
| HKRS2704-1-1 | "Lots within Kowloon Walled City" | 1987–91 | Lot records |
| HKRS163-1-3016 | "Electricity supply Kowloon Walled City" | 1963–64 | Power supply |
| HKRS163-9-502 | "New buildings in Kowloon Walled City" | 1968–75 | The tower boom |
| HKRS1375-1 | Urban Services Department hygiene files (confidential) | 1974–87 | Refuse, latrines, hygiene |
| HKRS439-11-1, -2 | "Demolition of Kowloon Walled City" | 1989–94 | Demolition |
| HKRS1149-1-2 | Town Planning Office, "Kowloon Walled City" | 1987–89 | Park planning |
| HKMS169-2-1 | James Hayes papers, "RAS visit to Kowloon Walled City, 6 May 1989" | 1983–89 | A first-hand visit |
| HKMS189-9-83 | Copy of UK file FCO 40/2476, "Future of Hong Kong: Kowloon Walled City" | 1988 | UK file |
| HKRS815-26-1456 | ArchSD drawing: footpath widening, Carpenter Rd to First St, plan and section | | Edge of the city |
| HKRS815-26-1244 to -1246, -1350 | ArchSD drawings: playground, Hok Lo Street | | Edge of the city |
| HKRS1496-1-29 | RTHK 鏗鏘集 "城寨", episode 70 | 2 Dec 1979 | TV film. Scope note: "經常停水電, 污水, 垃圾問題". Copies need RTHK approval |
| HKRS1500-1-3 | RTHK Weekly Magazine, "九龍城寨", episode 1 | 23 Mar 1985 | TV film. Scope note: "城寨內的環境" |
| HKRS2292-1-10 | RTHK *All About Us*, episode 22, "Report on Kowloon Walled City" | 20 Dec 1988 | TV film |
