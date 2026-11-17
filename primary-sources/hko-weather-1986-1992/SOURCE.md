# Hong Kong Observatory records, 1986-1992

Weather records of the time; data/weather.json already uses some HKO series, so these add series.

- **Status:** catalogued on 2026-11-17 by the source search of 2026-11. Nobody has read these items for the repo yet.
  "What it gives" is the short note of the agent that found the item. It is not a checked fact.
  Before you use a fact in the model, read it on the source and write it in this file with its
  page and a short exact quote.
- **Dates:** 1884-2026.
- **Items:** 12, of which 12 are open now. Value of the set: high.
- **Copyright:** see the licence of each item. Copyrighted files go in `local/`, which git ignores.
- **Stored in git:** this file only.

## Why this is primary

Each item says its class and the reason. An item that is "retrospective" is first-hand
testimony given later: tag its facts "retrospective (year)".

## Items

### services-1: Daily Mean Amount of Cloud (%) at the Hong Kong Observatory (日平均雲量(百分比) - 天文台)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1949-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** high
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_CLD_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-mean-amount-of-cloud
- **Proof that it exists:** Daily Mean Amount of Cloud (%) at the Hong Kong Observatory
- **What it gives (finder's note, not checked):** Daily mean cloud amount at the Observatory headquarters, 1949 on. Model week 15-21 Dec 1986: 24, 90, 95, 70, 10, 3, 11 per cent (all flagged C, complete).
- **Notes:** Rows checked again on 2026-11-16 in the saved file. data/weather.json now guesses the cloud from the sunshine (1 - sunH / 10.8). This file gives the measured cloud. Row format: 1986,12,15,24,C. First row of the file: 1949,1,1,68,C.

### services-2: Daily Mean Dew Point Temperature (°C) at the Hong Kong Observatory (日平均露點溫度(攝氏度) - 天文台)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1961-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** high
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_DEW_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-mean-dew-point, https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_WET_ALL.csv
- **Proof that it exists:** Daily Mean Dew Point Temperature (°C) at the Hong Kong Observatory
- **What it gives (finder's note, not checked):** Daily mean dew point at the Observatory headquarters, 1961 on. Model week 15-21 Dec 1986: 14.7, 14.9, 16.1, 14.9, 4.3, 7.2, 9.5 °C. The fall of about 10 °C on 19 Dec shows the dry northerly air.
- **Notes:** Rows checked again on 2026-11-16. First row of the file: 1961,1,1,6.9,C. The second alt URL is the sister series 'Daily Mean Wet-Bulb Temperature (°C) at the Hong Kong Observatory' (日平均濕球溫度(攝氏度) - 天文台), 1947 on, opened 2026-11-16: model week 16.8, 16.4, 17.3, 16.1, 9.1, 10.7, 12.6 °C. It adds little to the dew point, thus it is not a separate candidate.

### top-services-1: Daily Extract, 1986 (Hong Kong Observatory headquarters): data file dailyExtract_1986.xml

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1986
- **Kind:** data
- **Class:** primary (Official daily observations made at the time by the Observatory.)
- **Value:** high
- **Language:** en
- **Access:** open
- **Licence:** HKO open data terms (free use with acknowledgement; check the HKO disclaimer)
- **Link:** https://www.hko.gov.hk/cis/dailyExtract/dailyExtract_1986.xml
- **Other links:** https://www.hko.gov.hk/en/cis/dailyExtract.htm?y=1986&m=12
- **Proof that it exists:** JSON with key 'stn' and 12 monthly 'dayData' arrays; December row 15: ["15","1018.5","21.6","19.8","18.6","14.7","73","24","Trace","9.3","080","34.9"]
- **What it gives (finder's note, not checked):** One file with all daily elements of each day of 1986: mean pressure, maximum, mean and minimum temperature, dew point, relative humidity, cloud, rainfall, sunshine, prevailing wind direction and mean wind speed. For 15-21 Dec 1986 it gives, for example, a dry northerly surge on 19 Dec (min 10.1 C, wind 360 deg, 39.9 km/h, cloud 10%) and 1.3 mm of rain on 18 Dec.
- **Notes:** The file has no column labels. The order (day, pressure hPa, max, mean, min C, dew point C, RH %, cloud %, rainfall mm, sunshine h, wind direction deg, wind speed km/h) is INFERRED from the HKO Daily Extract page and from the values: column 8 matches cloud amount, not humidity. The values of max, min, RH, rain and sunshine match data/weather.json (for example 21.6/18.6/73/Trace/9.3 on 15 Dec). The HTML page loads the data by script; the monthly file name dailyExtract_198612.xml gives 404, the yearly one works. Some values carry a '#' mark that the file does not explain. It adds pressure, mean temperature, dew point, cloud and wind of the HKO headquarters, which the repo does not yet cite.

### services-3: Prevailing Wind Direction (°) - Waglan Island (盛行風向 (度) - 橫瀾島)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1975-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_PDIR_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-prevailing-wind-direction
- **Proof that it exists:** 盛行風向 (度) - 橫瀾島 / rows 1986,12,15,080,C to 1986,12,21,070,C
- **What it gives (finder's note, not checked):** Daily prevailing wind direction at Waglan Island, 1975 on. Model week 15-21 Dec 1986: 080, 070, 070, 360, 360, 070, 070 degrees: the wind turned to the north on 18-19 Dec, then back to east-north-east.
- **Notes:** Rows checked again on 2026-11-16. Waglan Island is an exposed island off the south-east of Hong Kong Island, far from the City. No wind series near the City goes back to 1986: Kai Tak (SE) starts 1998-10-01 and King's Park (KP) starts 1992-07-01 (first rows checked in the run of 2026-11-16 morning). King's Park thus covers the demolition years 1992-1994.

### services-4: Mean Wind Speed (km/h) - Waglan Island (平均風速 (公里/小時) - 橫瀾島)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1975-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_WSPD_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-mean-wind-speed
- **Proof that it exists:** 平均風速 (公里/小時) - 橫瀾島 / rows 1986,12,15,34.9,C to 1986,12,21,13.1,C
- **What it gives (finder's note, not checked):** Daily mean wind speed at Waglan Island, 1975 on. Model week 15-21 Dec 1986: 34.9, 43.4, 30.9, 23.5, 39.9, 25.2, 13.1 km/h.
- **Notes:** Rows checked again on 2026-11-16. An offshore station: the speed inside the City was much lower (INFERRED). Use it for the relative strength of each day only. First row: 1975,1,1,15.0,C.

### services-7: Global Solar Radiation (MJ/m²) - King's Park (太陽總輻射 (兆焦耳/平方米) - 京士柏)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1978-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_GSR_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-global-solar-radiation
- **Proof that it exists:** Global Solar Radiation (MJ/m&sup2;) - King's Park
- **What it gives (finder's note, not checked):** Daily global solar radiation at King's Park, Nov 1978 on. Model week 15-21 Dec 1986: 14.42, 6.02, 3.75, 2.28, 14.33, 14.72, 14.27 MJ/m². It can set the brightness of each day of the model.
- **Notes:** Rows checked again on 2026-11-16. King's Park is the sunshine station that data/weather.json already uses for the sunshine hours. First row: 1978,11,1,***,.

### services-5: Daily Mean Temperature (°C) at the Hong Kong Observatory (日平均氣溫(攝氏度) - 天文台)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1986-12 (rows read); the series is long
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=CLMTEMP&year=1986&month=12&rformat=csv&station=HKO
- **Other links:** https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=CLMTEMP&rformat=csv&station=HKO, https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-temperature-info-hko, https://data.weather.gov.hk/weatherAPI/doc/HKO_Open_Data_API_Documentation.pdf
- **Proof that it exists:** Daily Mean Temperature (°C) at the Hong Kong Observatory
- **What it gives (finder's note, not checked):** Daily mean air temperature at the Observatory headquarters. Model week 15-21 Dec 1986: 19.8, 18.6, 19.1, 17.7, 13.3, 14.1, 16.0 °C.
- **Notes:** Rows checked again on 2026-11-16. The repo already uses the maximum and minimum (data/weather.json); the mean is new. The API (dataType CLMTEMP, CLMMAXT, CLMMINT; Open Data API Documentation v1.13, Sep 2025) takes year, month and station. The Kowloon City station (KLT) is in the list, but the API gives no 1986 data for it.

### repo-audit-2: Daily Minimum Temperature (°C) at the Hong Kong Observatory (日最低氣溫(攝氏度) - 天文台), with the daily maximum, rainfall, relative humidity and King's Park sunshine files

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1986-12-15 to 1986-12-21
- **Kind:** data
- **Class:** primary (Daily weather observations recorded at the time by the official observatory.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** HKSAR Government data, DATA.GOV.HK terms and conditions
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MINT_ALL.csv
- **Other links:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MAXT_ALL.csv, https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_RF_ALL.csv, https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_RH_ALL.csv, https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_SUN_ALL.csv
- **Proof that it exists:** 日最低氣溫(攝氏度) - 天文台 / Daily Minimum Temperature (°C) at the Hong Kong Observatory
- **What it gives (finder's note, not checked):** The temperature, rain, humidity and sunshine of each day of the model week, 15-21 Dec 1986. The minimum fell from 18.3 °C on 17 Dec to 10.1 °C on 19 Dec.
- **Notes:** Used by data/weather.json (7 days, 5 source URLs) and in comments of src/life/sim.js and src/life/routines.js. I read the minimum-temperature file today: the values for 15-21 Dec 1986 (18.6, 18.1, 18.3, 12.9, 10.1, 11.7, 13.0, all flagged C = complete) agree with data/weather.json. No folder holds the files or their checksums.

### services-9: Hong Kong Observatory Open Data

- **Creator:** Hong Kong Observatory (香港天文台)
- **Date:** 2026 (page as read)
- **Kind:** catalogue
- **Class:** primary (The official index of the Observatory's own daily records; it is a finding aid for primary data.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © HKSAR Government
- **Link:** https://www.hko.gov.hk/en/abouthko/opendata_intro.htm
- **Proof that it exists:** Hong Kong Observatory Open Data｜Hong Kong Observatory(HKO)｜e-Services
- **What it gives (finder's note, not checked):** The list of 19 daily climate datasets on data.gov.hk, with links: cloud, dew point, wet bulb, pressure, evaporation, rainfall, humidity, temperatures, grass minimum, sea temperature, solar radiation, UV, sunshine, prevailing wind, wind speed, reduced visibility, lightning, heat index.
- **Notes:** Read again on 2026-11-16. Checked for Dec 1986 on 2026-11-16: grass minimum (HKO, 1968 on: see services-16) and mean wet bulb (HKO, 1947 on: see services-2) have the model week; mean sea temperature (Waglan Island) starts only in 1990 (first row 1990,1,1,***). Reduced visibility is at the new airport (HKA) only, thus not 1986. UV, heat index and lightning series are recent (INFERRED). The page has no link to the Monthly Weather Summary (see services-15).

### services-6: Daily Mean Pressure (hPa) at the Hong Kong Observatory (日平均氣壓(百帕斯卡) - 天文台)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1884-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MSLP_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-mean-pressure
- **Proof that it exists:** Daily Mean Pressure (hPa) at the Hong Kong Observatory
- **What it gives (finder's note, not checked):** Daily mean pressure at the Observatory headquarters. Model week 15-21 Dec 1986: 1018.5, 1019.6, 1019.6, 1021.1, 1025.1, 1024.8, 1025.4 hPa: the rise of 18-19 Dec marks the winter monsoon surge.
- **Notes:** Rows checked again on 2026-11-16. First row: 1884,3,1,***, (no value).

### services-8: Daily Total Evaporation (mm) at King's Park (日總蒸發量(毫米) - 京士柏)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1968-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_EVAP_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-total-evaporation
- **Proof that it exists:** Daily Total Evaporation (mm) at King's Park
- **What it gives (finder's note, not checked):** Daily evaporation at King's Park, 1968 on. Model week 15-21 Dec 1986: 3.9, 1.5, 1.2, 1.5, 3.7, 2.0, 3.5 mm. It can tell how fast the laundry on the facades dried (INFERRED use).
- **Notes:** Rows checked again on 2026-11-16. First row: 1968,1,1,4.3,C.

### services-16: Daily Grass Minimun Temperature (°C) at the Hong Kong Observatory (日平均草溫(攝氏度) - 天文台)

- **Creator:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong
- **Date:** 1968-2026 (series); rows for 1986-12
- **Kind:** data
- **Class:** primary (Daily observations made at the time by the official weather service.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** DATA.GOV.HK terms of use (free reuse with acknowledgement); terms not re-read in this session
- **Link:** https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_GMT_ALL.csv
- **Other links:** https://data.gov.hk/en-data/dataset/hk-hko-rss-daily-grass-min-temp
- **Proof that it exists:** "Daily Grass Minimun Temperature (°C) at the Hong Kong Observatory" (the file spells 'Minimun')
- **What it gives (finder's note, not checked):** The lowest temperature of each night on the grass at the Observatory, 1968 on. Model week 15-21 Dec 1986: 13.9, 15.4, 15.7, 16.5, 7.7, 7.6, 8.9 °C. It shows how cold the open roofs were on the clear nights of 19-21 Dec (INFERRED use).
- **Notes:** First row: 1968,1,1,4.2,C. The dataset page calls the file 'Daily Grass Minimum Temperature, All Year (Hong Kong Observatory)'.
