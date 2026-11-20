# Hong Kong Observatory records, 1986-1992

Weather records of the time; data/weather.json already uses some HKO series, so these add series.

- **Status:** read: 12 of 12 items read by the reading of the source search of 2026-11.
  A checker checked a sample of the facts. Each fact gives its page and a short exact quote.
- **Dates:** 1884-2026.
- **Items:** 12, of which 12 are open now. Value of the set: high.
- **Copyright:** see the licence of each item. Copyrighted files go in `local/`, which git ignores.
- **Stored in git:** this file only.

## Why this is primary

Each item says its class and the reason. An item that is "retrospective" is first-hand
testimony given later: tag its facts "retrospective (year)".

## Items

### services-1: Daily Mean Amount of Cloud (%) at the Hong Kong Observatory (日平均雲量(百分比) - 天文台)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Mean Amount of Cloud (%) at the Hong Kong Observatory' (日平均雲量(百分比) - 天文台), CSV file, series 1949-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily mean amount of cloud'. https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_CLD_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-1-daily_HKO_CLD_ALL.csv` (in `local/`, not in git): Daily mean amount of cloud, HKO headquarters, 1949-2026. CSV, 425122 bytes, sha256 a27923051992d8931d07bf61bb5e5f38ccc2cc557b73eb25713e643bf61fe6db as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_CLD_ALL.csv; 425122 bytes; SHA-256 `a27923051992d8931d07bf61bb5e5f38ccc2cc557b73eb25713e643bf61fe6db`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_HKO_CLD_ALL.csv, row 1986,12,15,24,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 24% (flag C). | "1986,12,15,24,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,16,90,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 90% (flag C). | "1986,12,16,90,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,17,95,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 95% (flag C). | "1986,12,17,95,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,18,70,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 70% (flag C). | "1986,12,18,70,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,19,10,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 10% (flag C). | "1986,12,19,10,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,20,3,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 3% (flag C). | "1986,12,20,3,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,21,11,C | The mean amount of cloud at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 11% (flag C). | "1986,12,21,11,C" |
| daily_HKO_CLD_ALL.csv, rows of December 1986 | The cloud of December 1986 ranged from 3% on Saturday 20 December to 98% on 2 and 3 December. The mean of the 31 rows is 49.9%, which the Daily Extract rounds to 50. | "1986,12,20,3,C" |
| daily_HKO_CLD_ALL.csv, row 1986,12,18 | The measured cloud of the model week (24, 90, 95, 70, 10, 3, 11%) differs from the cloud that data/weather.json derives from the sunshine (0.14, 0.87, 1, 1, 0.13 to 0.15): on Thursday 18 December the sky had 70% cloud, not full cover. | "1986,12,18,70,C" |
### services-2: Daily Mean Dew Point Temperature (°C) at the Hong Kong Observatory (日平均露點溫度(攝氏度) - 天文台)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Mean Dew Point Temperature (°C) at the Hong Kong Observatory' (日平均露點溫度(攝氏度) - 天文台), CSV file, series 1961-2026, rows 1986,12,15 to 1986,12,21, https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_DEW_ALL.csv; with 'Daily Mean Wet-Bulb Temperature (°C) at the Hong Kong Observatory' (日平均濕球溫度(攝氏度) - 天文台), series 1947-2026, https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_WET_ALL.csv. DATA.GOV.HK. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (files as served on 2026-11-19)
- **Files:**
  - `services-2-daily_HKO_DEW_ALL.csv` (in `local/`, not in git): Daily mean dew point, HKO headquarters, 1961-2026. CSV, 405853 bytes, sha256 1e28b190413fbf9dce2e1e830e3b13f995cc08e958ae4b72aa8dc6122a5f34a4 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_DEW_ALL.csv; 405853 bytes; SHA-256 `1e28b190413fbf9dce2e1e830e3b13f995cc08e958ae4b72aa8dc6122a5f34a4`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
  - `services-2-daily_HKO_WET_ALL.csv` (in `local/`, not in git): Daily mean wet-bulb temperature, HKO headquarters, 1947-2026. CSV, 493698 bytes, sha256 d1a619a30cb0a3d590b89fe7ae131cdaccb48aaa0fb7fde26e53d098bdc8b973 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_WET_ALL.csv; 493698 bytes; SHA-256 `d1a619a30cb0a3d590b89fe7ae131cdaccb48aaa0fb7fde26e53d098bdc8b973`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_HKO_DEW_ALL.csv, row 1986,12,15,14.7,C | The mean dew point at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 14.7 °C (flag C). | "1986,12,15,14.7,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,16,14.9,C | The mean dew point at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 14.9 °C (flag C). | "1986,12,16,14.9,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,17,16.1,C | The mean dew point at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 16.1 °C (flag C). | "1986,12,17,16.1,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,18,14.9,C | The mean dew point at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 14.9 °C (flag C). | "1986,12,18,14.9,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,19,4.3,C | The mean dew point at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 4.3 °C (flag C). | "1986,12,19,4.3,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,20,7.2,C | The mean dew point at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 7.2 °C (flag C). | "1986,12,20,7.2,C" |
| daily_HKO_DEW_ALL.csv, row 1986,12,21,9.5,C | The mean dew point at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 9.5 °C (flag C). | "1986,12,21,9.5,C" |
| daily_HKO_DEW_ALL.csv, rows 1986,12,18-19 | The dew point fell from 14.9 °C on Thursday 18 December to 4.3 °C on Friday 19 December 1986: the air became much drier. 4.3 °C was the lowest daily mean dew point of December 1986. | "1986,12,19,4.3,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,15,16.8,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 16.8 °C (flag C). | "1986,12,15,16.8,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,16,16.4,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 16.4 °C (flag C). | "1986,12,16,16.4,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,17,17.3,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 17.3 °C (flag C). | "1986,12,17,17.3,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,18,16.1,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 16.1 °C (flag C). | "1986,12,18,16.1,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,19,9.1,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 9.1 °C (flag C). | "1986,12,19,9.1,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,20,10.7,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 10.7 °C (flag C). | "1986,12,20,10.7,C" |
| daily_HKO_WET_ALL.csv, row 1986,12,21,12.6,C | The mean wet-bulb temperature at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 12.6 °C (flag C). | "1986,12,21,12.6,C" |
### top-services-1: Daily Extract, 1986 (Hong Kong Observatory headquarters): data file dailyExtract_1986.xml

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, Daily Extract of Meteorological Observations, 1986: data file dailyExtract_1986.xml, December block, rows 15-21 (and 13-23, Mean/Total), https://www.hko.gov.hk/cis/dailyExtract/dailyExtract_1986.xml; column headings from the Daily Extract page (last revised 29 December 2023), https://www.hko.gov.hk/en/cis/dailyExtract.htm?y=1986&m=12. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong, served now as one yearly data file. The column headings and remarks come from the present-day page (revised 2023); those facts are kind secondary. It stays in primary-sources/.)
- **Date of the record:** daily observations of 1986, December rows 15-21 for the model week (file as served on 2026-11-19)
- **Files:**
  - `top-services-1-dailyExtract_1986.xml` (in `local/`, not in git): Daily Extract data file of 1986 (JSON text with a .xml name): eleven daily elements for each day of 1986 at the HKO headquarters, King's Park (sunshine) and Waglan Island (wind), with monthly Mean/Total rows. Small text file.; https://www.hko.gov.hk/cis/dailyExtract/dailyExtract_1986.xml; 31835 bytes; SHA-256 `0943a24ee78d2afb8e036466f304839245dea28ecf817c4977aedd241d4ae561`; licence: HKO website Intellectual Property Rights Notice, Disclaimer and Conditions of Use: materials owned by the HKSAR Government; "the use of the Materials for commercial purposes is strictly prohibited unless all the conditions" are met and prior written authorisation is obtained. No named open licence. (https://www.hko.gov.hk/en/readme/readme.htm)
- **Note:** its 8 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| December block, day row "13" | Saturday 13 December 1986 (outside the model week): mean pressure 1018.0 hPa; maximum 21.2 °C, mean 18.8 °C, minimum 16.9 °C; dew point 15.9 °C; relative humidity 84%; cloud 14%; rainfall 0.0 mm; sunshine at King's Park 9.2 h; wind at Waglan Island 070 degrees, 14.2 km/h. | "["13","1018.0","21.2","18.8","16.9","15.9","84","14"," 0.0","9.2","070","14.2"]" |
| December block, day row "14" | Sunday 14 December 1986 (the day before the model week): mean pressure 1017.8 hPa; maximum 22.9 °C, mean 20.3 °C, minimum 17.6 °C; dew point 16.4 °C; relative humidity 79%; cloud 10%; rainfall 0.0 mm; sunshine at King's Park 9.2 h; wind at Waglan Island 330 degrees, 5.0 km/h. The wind direction carries "#" (data incomplete). | "["14","1017.8","22.9","20.3","17.6","16.4","79","10"," 0.0","9.2"," 330#","5.0"]" |
| December block, day row "15" | Monday 15 December 1986: mean pressure 1018.5 hPa; maximum 21.6 °C, mean 19.8 °C, minimum 18.6 °C; dew point 14.7 °C; relative humidity 73%; cloud 24%; rainfall a trace; sunshine at King's Park 9.3 h; wind at Waglan Island 080 degrees, 34.9 km/h. | "["15","1018.5","21.6","19.8","18.6","14.7","73","24","Trace","9.3","080","34.9"]" |
| December block, day row "16" | Tuesday 16 December 1986: mean pressure 1019.6 hPa; maximum 19.6 °C, mean 18.6 °C, minimum 18.1 °C; dew point 14.9 °C; relative humidity 79%; cloud 90%; rainfall a trace; sunshine at King's Park 1.4 h; wind at Waglan Island 070 degrees, 43.4 km/h. | "["16","1019.6","19.6","18.6","18.1","14.9","79","90","Trace","1.4","070","43.4"]" |
| December block, day row "17" | Wednesday 17 December 1986: mean pressure 1019.6 hPa; maximum 19.8 °C, mean 19.1 °C, minimum 18.3 °C; dew point 16.1 °C; relative humidity 83%; cloud 95%; rainfall a trace; sunshine at King's Park 0.0 h; wind at Waglan Island 070 degrees, 30.9 km/h. | "["17","1019.6","19.8","19.1","18.3","16.1","83","95","Trace","0.0","070","30.9"]" |
| December block, day row "18" | Thursday 18 December 1986: mean pressure 1021.1 hPa; maximum 20.4 °C, mean 17.7 °C, minimum 12.9 °C; dew point 14.9 °C; relative humidity 84%; cloud 70%; rainfall 1.3 mm; sunshine at King's Park 0.0 h; wind at Waglan Island 360 degrees, 23.5 km/h. | "["18","1021.1","20.4","17.7","12.9","14.9","84","70"," 1.3","0.0","360","23.5"]" |
| December block, day row "19" | Friday 19 December 1986: mean pressure 1025.1 hPa; maximum 16.6 °C, mean 13.3 °C, minimum 10.1 °C; dew point 4.3 °C; relative humidity 55%; cloud 10%; rainfall 0.0 mm; sunshine at King's Park 9.4 h; wind at Waglan Island 360 degrees, 39.9 km/h. | "["19","1025.1","16.6","13.3","10.1"," 4.3","55","10"," 0.0","9.4","360","39.9"]" |
| December block, day row "20" | Saturday 20 December 1986: mean pressure 1024.8 hPa; maximum 16.6 °C, mean 14.1 °C, minimum 11.7 °C; dew point 7.2 °C; relative humidity 64%; cloud 3%; rainfall 0.0 mm; sunshine at King's Park 9.2 h; wind at Waglan Island 070 degrees, 25.2 km/h. | "["20","1024.8","16.6","14.1","11.7"," 7.2","64"," 3"," 0.0","9.2","070","25.2"]" |
| December block, day row "21" | Sunday 21 December 1986: mean pressure 1025.4 hPa; maximum 19.5 °C, mean 16.0 °C, minimum 13.0 °C; dew point 9.5 °C; relative humidity 66%; cloud 11%; rainfall 0.0 mm; sunshine at King's Park 9.5 h; wind at Waglan Island 070 degrees, 13.1 km/h. | "["21","1025.4","19.5","16.0","13.0"," 9.5","66","11"," 0.0","9.5","070","13.1"]" |
| December block, day row "22" | Monday 22 December 1986 (the day after the model week): mean pressure 1024.7 hPa; maximum 18.7 °C, mean 15.8 °C, minimum 13.1 °C; dew point 8.7 °C; relative humidity 63%; cloud 15%; rainfall 0.0 mm; sunshine at King's Park 9.6 h; wind at Waglan Island 010 degrees, 28.6 km/h. | "["22","1024.7","18.7","15.8","13.1"," 8.7","63","15"," 0.0","9.6","010","28.6"]" |
| December block, day row "23" | Tuesday 23 December 1986 (outside the model week): mean pressure 1022.2 hPa; maximum 19.0 °C, mean 16.8 °C, minimum 14.6 °C; dew point 12.6 °C; relative humidity 77%; cloud 21%; rainfall 0.0 mm; sunshine at King's Park 8.1 h; wind at Waglan Island 070 degrees, 22.5 km/h. | "["23","1022.2","19.0","16.8","14.6","12.6","77","21"," 0.0","8.1","070","22.5"]" |
| December block, "Mean/Total" row | The December 1986 "Mean/Total" row gives: mean pressure 1021.5 hPa; mean maximum 20.0 °C, mean 17.7 °C, mean minimum 15.8 °C; dew point 12.9 °C; relative humidity 75%; cloud 50%; total rainfall 46.6 mm; total sunshine 178.1 hours; prevailing wind 080 degrees; mean wind speed 26.4 km/h. | "["Mean/Total","1021.5","20.0","17.7","15.8","12.9","75","50"," 46.6","178.1","080","26.4"]" |
| January block, day row "01" | The first day row of the file (1 January 1986) is a cold dry northerly day: maximum 15.4 °C, minimum 9.9 °C, dew point 3.3 °C, wind 360 degrees at 39.9 km/h. | "["01","1021.8","15.4","12.5"," 9.9"," 3.3","54","31"," 0.0","8.0","360","39.9"]" |

- **Leads:**
  - Royal Observatory, Hong Kong, Monthly Weather Summary, December 1986 (the printed record behind these values; the finder lists it as services-15, not in this chunk)
### services-3: Prevailing Wind Direction (°) - Waglan Island (盛行風向 (度) - 橫瀾島)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Prevailing Wind Direction (°) - Waglan Island' (盛行風向 (度) - 橫瀾島), CSV file, series 1975-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily prevailing wind direction'. https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_PDIR_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-3-daily_WGL_PDIR_ALL.csv` (in `local/`, not in git): Daily prevailing wind direction, Waglan Island, 1975-2026. CSV, 301587 bytes, sha256 d85a1e6bd92c0ac078a3e352bc477d5396e88b5e1db79d33ef073feb67ad7e32 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_PDIR_ALL.csv; 301587 bytes; SHA-256 `d85a1e6bd92c0ac078a3e352bc477d5396e88b5e1db79d33ef073feb67ad7e32`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_WGL_PDIR_ALL.csv, row 1986,12,15,080,C | The prevailing wind direction at Waglan Island (橫瀾島) on Monday 15 December 1986 was 080 degrees (about east) (flag C). | "1986,12,15,080,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,16,070,C | The prevailing wind direction at Waglan Island (橫瀾島) on Tuesday 16 December 1986 was 070 degrees (east-north-east) (flag C). | "1986,12,16,070,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,17,070,C | The prevailing wind direction at Waglan Island (橫瀾島) on Wednesday 17 December 1986 was 070 degrees (east-north-east) (flag C). | "1986,12,17,070,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,18,360,C | The prevailing wind direction at Waglan Island (橫瀾島) on Thursday 18 December 1986 was 360 degrees (north) (flag C). | "1986,12,18,360,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,19,360,C | The prevailing wind direction at Waglan Island (橫瀾島) on Friday 19 December 1986 was 360 degrees (north) (flag C). | "1986,12,19,360,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,20,070,C | The prevailing wind direction at Waglan Island (橫瀾島) on Saturday 20 December 1986 was 070 degrees (east-north-east) (flag C). | "1986,12,20,070,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,21,070,C | The prevailing wind direction at Waglan Island (橫瀾島) on Sunday 21 December 1986 was 070 degrees (east-north-east) (flag C). | "1986,12,21,070,C" |
| daily_WGL_PDIR_ALL.csv, row 1986,12,14 | On Sunday 14 December 1986, the day before the model week, the prevailing wind at Waglan Island was 330 degrees, but the row is flagged # (data incomplete). It is one of five rows of 1986 with that flag. | "1986,12,14,330,#" |
| daily_WGL_PDIR_ALL.csv, rows 1986,12,18-20 | The wind at Waglan Island turned to the north (360 degrees) on Thursday 18 and Friday 19 December 1986 and returned to 070 degrees on Saturday 20 December. | "1986,12,18,360,C" |

- **Leads:**
  - Daily prevailing wind direction, King's Park: https://data.weather.gov.hk/cis/csvfile/KP/ALL/daily_KP_PDIR_ALL.csv (listed on the dataset page; the finder says it starts 1992-07-01, which covers the clearance years; not opened by me)
  - Daily prevailing wind direction, Kai Tak: https://data.weather.gov.hk/cis/csvfile/SE/ALL/daily_SE_PDIR_ALL.csv (listed on the dataset page; the finder says it starts 1998-10-01; not opened by me)
### services-4: Mean Wind Speed (km/h) - Waglan Island (平均風速 (公里/小時) - 橫瀾島)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Mean Wind Speed (km/h) - Waglan Island' (平均風速 (公里/小時) - 橫瀾島), CSV file, series 1975-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily mean wind speed'. https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_WSPD_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-4-daily_WGL_WSPD_ALL.csv` (in `local/`, not in git): Daily mean wind speed, Waglan Island, 1975-2026. CSV, 318410 bytes, sha256 e66352ac0a6d57f9c3211f2c32e8ec670858ff84816cd2956451612aa72e0f35 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/cis/csvfile/WGL/ALL/daily_WGL_WSPD_ALL.csv; 318410 bytes; SHA-256 `e66352ac0a6d57f9c3211f2c32e8ec670858ff84816cd2956451612aa72e0f35`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_WGL_WSPD_ALL.csv, row 1986,12,15,34.9,C | The mean wind speed at Waglan Island (橫瀾島) on Monday 15 December 1986 was 34.9 km/h (flag C). | "1986,12,15,34.9,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,16,43.4,C | The mean wind speed at Waglan Island (橫瀾島) on Tuesday 16 December 1986 was 43.4 km/h (flag C). | "1986,12,16,43.4,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,17,30.9,C | The mean wind speed at Waglan Island (橫瀾島) on Wednesday 17 December 1986 was 30.9 km/h (flag C). | "1986,12,17,30.9,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,18,23.5,C | The mean wind speed at Waglan Island (橫瀾島) on Thursday 18 December 1986 was 23.5 km/h (flag C). | "1986,12,18,23.5,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,19,39.9,C | The mean wind speed at Waglan Island (橫瀾島) on Friday 19 December 1986 was 39.9 km/h (flag C). | "1986,12,19,39.9,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,20,25.2,C | The mean wind speed at Waglan Island (橫瀾島) on Saturday 20 December 1986 was 25.2 km/h (flag C). | "1986,12,20,25.2,C" |
| daily_WGL_WSPD_ALL.csv, row 1986,12,21,13.1,C | The mean wind speed at Waglan Island (橫瀾島) on Sunday 21 December 1986 was 13.1 km/h (flag C). | "1986,12,21,13.1,C" |
| daily_WGL_WSPD_ALL.csv, rows of December 1986 | The calmest day of December 1986 at Waglan Island was Sunday 14 December (5.0 km/h), the day before the model week. The windiest was 26 December (45.6 km/h). In the model week the windiest day was Tuesday 16 December (43.4 km/h). | "1986,12,14,5.0,C" |
### services-7: Global Solar Radiation (MJ/m²) - King's Park (太陽總輻射 (兆焦耳/平方米) - 京士柏)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Global Solar Radiation (MJ/m²) - King's Park' (太陽總輻射 (兆焦耳/平方米) - 京士柏), CSV file, series 1978-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily global solar radiation'. https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_GSR_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-7-daily_KP_GSR_ALL.csv` (in `local/`, not in git): Daily global solar radiation, King's Park, 1978-2026. CSV, 309248 bytes, sha256 c140ad5ed0d61cc6feb2ec1b5bb80a288a4febcbf2cde74157ddb5beafa00272 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_GSR_ALL.csv; 309248 bytes; SHA-256 `c140ad5ed0d61cc6feb2ec1b5bb80a288a4febcbf2cde74157ddb5beafa00272`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_KP_GSR_ALL.csv, row 1986,12,15,14.42,C | The global solar radiation at King's Park (京士柏) on Monday 15 December 1986 was 14.42 MJ/m² (flag C). | "1986,12,15,14.42,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,16,6.02,C | The global solar radiation at King's Park (京士柏) on Tuesday 16 December 1986 was 6.02 MJ/m² (flag C). | "1986,12,16,6.02,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,17,3.75,C | The global solar radiation at King's Park (京士柏) on Wednesday 17 December 1986 was 3.75 MJ/m² (flag C). | "1986,12,17,3.75,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,18,2.28,C | The global solar radiation at King's Park (京士柏) on Thursday 18 December 1986 was 2.28 MJ/m² (flag C). | "1986,12,18,2.28,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,19,14.33,C | The global solar radiation at King's Park (京士柏) on Friday 19 December 1986 was 14.33 MJ/m² (flag C). | "1986,12,19,14.33,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,20,14.72,C | The global solar radiation at King's Park (京士柏) on Saturday 20 December 1986 was 14.72 MJ/m² (flag C). | "1986,12,20,14.72,C" |
| daily_KP_GSR_ALL.csv, row 1986,12,21,14.27,C | The global solar radiation at King's Park (京士柏) on Sunday 21 December 1986 was 14.27 MJ/m² (flag C). | "1986,12,21,14.27,C" |
| daily_KP_GSR_ALL.csv, rows of December 1986 | The darkest day of December 1986 at King's Park by solar radiation was 26 December (1.93 MJ/m²); in the model week it was Thursday 18 December (2.28 MJ/m²). The brightest day of the month was 12 December (15.32 MJ/m²). | "1986,12,18,2.28,C" |
### services-5: Daily Mean Temperature (°C) at the Hong Kong Observatory (日平均氣溫(攝氏度) - 天文台)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Mean Temperature (°C) at the Hong Kong Observatory' (日平均氣溫(攝氏度) - 天文台), HKO Open Data API, dataType=CLMTEMP, station=HKO, year=1986, month=12. https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=CLMTEMP&year=1986&month=12&rformat=csv&station=HKO. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (API response of 2026-11-19)
- **Files:**
  - `services-5-opendata.php` (in `local/`, not in git): Daily mean temperature, HKO headquarters, December 1986 only (31 rows, small CSV from the API).; https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=CLMTEMP&year=1986&month=12&rformat=csv&station=HKO; 837 bytes; SHA-256 `339d5320f615cb37698281d00b44a9a0b2dcd96bc312663de29dff62d8f97216`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| API JSON response, data row for day 15 | The mean air temperature at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 19.8 °C (flag C). | "["1986","12","15","19.8","C"]" |
| API JSON response, data row for day 16 | The mean air temperature at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 18.6 °C (flag C). | "["1986","12","16","18.6","C"]" |
| API JSON response, data row for day 17 | The mean air temperature at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 19.1 °C (flag C). | "["1986","12","17","19.1","C"]" |
| API JSON response, data row for day 18 | The mean air temperature at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 17.7 °C (flag C). | "["1986","12","18","17.7","C"]" |
| API JSON response, data row for day 19 | The mean air temperature at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 13.3 °C (flag C). | "["1986","12","19","13.3","C"]" |
| API JSON response, data row for day 20 | The mean air temperature at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 14.1 °C (flag C). | "["1986","12","20","14.1","C"]" |
| API JSON response, data row for day 21 | The mean air temperature at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 16.0 °C (flag C). | "["1986","12","21","16.0","C"]" |
| API response for December 1986 (CSV and JSON forms) | The warmest day of December 1986 by mean temperature was Sunday 14 December (20.3 °C); the coolest was Friday 19 December (13.3 °C). | "["1986","12","19","13.3","C"]" |
| API JSON response, data row for day 22 | On Monday 22 December 1986, the day after the model week, the mean temperature was 15.8 °C. | "["1986","12","22","15.8","C"]" |

- **Leads:**
  - HKO Open Data API Documentation (PDF): https://data.weather.gov.hk/weatherAPI/doc/HKO_Open_Data_API_Documentation.pdf (alt URL; not opened by me; it lists the dataTypes and stations)
### repo-audit-2: Daily Minimum Temperature (°C) at the Hong Kong Observatory (日最低氣溫(攝氏度) - 天文台), with the daily maximum, rainfall, relative humidity and King's Park sunshine files

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong: 'Daily Minimum Temperature (°C) at the Hong Kong Observatory' (日最低氣溫(攝氏度) - 天文台), 'Daily Maximum Temperature (°C) at the Hong Kong Observatory' (日最高氣溫(攝氏度) - 天文台), 'Daily Total Rainfall (mm) at the Hong Kong Observatory' (日總雨量(毫米) - 天文台), 'Daily Mean Relative Humidity (%) at the Hong Kong Observatory' (日平均相對濕度(百分比) - 天文台) and 'Total Bright Sunshine (hours) - King's Park' (總日照 (小時) - 京士柏). CSV files on DATA.GOV.HK, rows 1986,12,15 to 1986,12,21. https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MINT_ALL.csv (and daily_HKO_MAXT_ALL.csv, daily_HKO_RF_ALL.csv, daily_HKO_RH_ALL.csv, KP/ALL/daily_KP_SUN_ALL.csv). Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (files as served on 2026-11-19)
- **Files:**
  - `repo-audit-2-daily_HKO_MINT_ALL.csv` (in `local/`, not in git): Daily minimum temperature, HKO headquarters, 1884-2026. CSV, 840187 bytes, sha256 0219f9062d0edf203123d8e5cdd09648cd37ab1a243d492f6b518c2d7cda5061 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MINT_ALL.csv; 840187 bytes; SHA-256 `0219f9062d0edf203123d8e5cdd09648cd37ab1a243d492f6b518c2d7cda5061`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
  - `repo-audit-2-daily_HKO_MAXT_ALL.csv` (in `local/`, not in git): Daily maximum temperature, HKO headquarters, 1884-2026. CSV, 841405 bytes, sha256 7ebd5a9d9a4d610573a51017bac19153b5f0322d42b22341c51d5654c54a0c04 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MAXT_ALL.csv; 841405 bytes; SHA-256 `7ebd5a9d9a4d610573a51017bac19153b5f0322d42b22341c51d5654c54a0c04`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
  - `repo-audit-2-daily_HKO_RF_ALL.csv` (in `local/`, not in git): Daily total rainfall, HKO headquarters, 1884-2026. CSV, 812082 bytes, sha256 4d25d10550f0d98f77e1225a5bf4d92e8e933d02f1fc3946b9cab82287ff03ad as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_RF_ALL.csv; 812082 bytes; SHA-256 `4d25d10550f0d98f77e1225a5bf4d92e8e933d02f1fc3946b9cab82287ff03ad`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
  - `repo-audit-2-daily_HKO_RH_ALL.csv` (in `local/`, not in git): Daily mean relative humidity, HKO headquarters, 1947-2026. CSV, 436339 bytes, sha256 165dc318e4075986e7417d922490cbdaf6f38444bdcca26e78ad55f6b557ddaa as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_RH_ALL.csv; 436339 bytes; SHA-256 `165dc318e4075986e7417d922490cbdaf6f38444bdcca26e78ad55f6b557ddaa`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
  - `repo-audit-2-daily_KP_SUN_ALL.csv` (in `local/`, not in git): Daily total bright sunshine, King's Park, 1961-2026. CSV, 387063 bytes, sha256 caa91baf659c9cf9d1aa17c0a80f06862dfc3d0fbf5a2595cc3a2d0846e9f737 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_SUN_ALL.csv; 387063 bytes; SHA-256 `caa91baf659c9cf9d1aa17c0a80f06862dfc3d0fbf5a2595cc3a2d0846e9f737`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 7 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_HKO_MINT_ALL.csv, row 1986,12,15,18.6,C | The minimum air temperature at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 18.6 °C (flag C, data complete). | "1986,12,15,18.6,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,16,18.1,C | The minimum air temperature at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 18.1 °C (flag C, data complete). | "1986,12,16,18.1,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,17,18.3,C | The minimum air temperature at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 18.3 °C (flag C, data complete). | "1986,12,17,18.3,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,18,12.9,C | The minimum air temperature at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 12.9 °C (flag C, data complete). | "1986,12,18,12.9,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,19,10.1,C | The minimum air temperature at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 10.1 °C (flag C, data complete). | "1986,12,19,10.1,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,20,11.7,C | The minimum air temperature at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 11.7 °C (flag C, data complete). | "1986,12,20,11.7,C" |
| daily_HKO_MINT_ALL.csv, row 1986,12,21,13.0,C | The minimum air temperature at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 13.0 °C (flag C, data complete). | "1986,12,21,13.0,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,15,21.6,C | The maximum air temperature at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 21.6 °C (flag C). | "1986,12,15,21.6,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,16,19.6,C | The maximum air temperature at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 19.6 °C (flag C). | "1986,12,16,19.6,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,17,19.8,C | The maximum air temperature at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 19.8 °C (flag C). | "1986,12,17,19.8,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,18,20.4,C | The maximum air temperature at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 20.4 °C (flag C). | "1986,12,18,20.4,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,19,16.6,C | The maximum air temperature at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 16.6 °C (flag C). | "1986,12,19,16.6,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,20,16.6,C | The maximum air temperature at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 16.6 °C (flag C). | "1986,12,20,16.6,C" |
| daily_HKO_MAXT_ALL.csv, row 1986,12,21,19.5,C | The maximum air temperature at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 19.5 °C (flag C). | "1986,12,21,19.5,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,15,Trace,C | The total rainfall at the Hong Kong Observatory headquarters on Monday 15 December 1986 was a trace (less than 0.05 mm) (flag C). | "1986,12,15,Trace,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,16,Trace,C | The total rainfall at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was a trace (less than 0.05 mm) (flag C). | "1986,12,16,Trace,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,17,Trace,C | The total rainfall at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was a trace (less than 0.05 mm) (flag C). | "1986,12,17,Trace,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,18,1.3,C | The total rainfall at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 1.3 mm (flag C). | "1986,12,18,1.3,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,19,0.0,C | The total rainfall at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 0.0 mm (flag C). | "1986,12,19,0.0,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,20,0.0,C | The total rainfall at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 0.0 mm (flag C). | "1986,12,20,0.0,C" |
| daily_HKO_RF_ALL.csv, row 1986,12,21,0.0,C | The total rainfall at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 0.0 mm (flag C). | "1986,12,21,0.0,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,15,73,C | The mean relative humidity at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 73% (flag C). | "1986,12,15,73,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,16,79,C | The mean relative humidity at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 79% (flag C). | "1986,12,16,79,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,17,83,C | The mean relative humidity at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 83% (flag C). | "1986,12,17,83,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,18,84,C | The mean relative humidity at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 84% (flag C). | "1986,12,18,84,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,19,55,C | The mean relative humidity at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 55% (flag C). | "1986,12,19,55,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,20,64,C | The mean relative humidity at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 64% (flag C). | "1986,12,20,64,C" |
| daily_HKO_RH_ALL.csv, row 1986,12,21,66,C | The mean relative humidity at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 66% (flag C). | "1986,12,21,66,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,15,9.3,C | The total bright sunshine at King's Park (京士柏) on Monday 15 December 1986 was 9.3 hours (flag C). | "1986,12,15,9.3,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,16,1.4,C | The total bright sunshine at King's Park (京士柏) on Tuesday 16 December 1986 was 1.4 hours (flag C). | "1986,12,16,1.4,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,17,0.0,C | The total bright sunshine at King's Park (京士柏) on Wednesday 17 December 1986 was 0.0 hours (flag C). | "1986,12,17,0.0,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,18,0.0,C | The total bright sunshine at King's Park (京士柏) on Thursday 18 December 1986 was 0.0 hours (flag C). | "1986,12,18,0.0,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,19,9.4,C | The total bright sunshine at King's Park (京士柏) on Friday 19 December 1986 was 9.4 hours (flag C). | "1986,12,19,9.4,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,20,9.2,C | The total bright sunshine at King's Park (京士柏) on Saturday 20 December 1986 was 9.2 hours (flag C). | "1986,12,20,9.2,C" |
| daily_KP_SUN_ALL.csv, row 1986,12,21,9.5,C | The total bright sunshine at King's Park (京士柏) on Sunday 21 December 1986 was 9.5 hours (flag C). | "1986,12,21,9.5,C" |
| daily_HKO_MINT_ALL.csv, rows 1986,12,1 to 1986,12,31 | The minimum of 10.1 °C on Friday 19 December 1986 was the lowest daily minimum of December 1986 at the Observatory headquarters. I compared all 31 rows of the month; the highest minimum of the month was 18.7 °C, on 6 December and again on 31 December. | "1986,12,19,10.1,C" |
| daily_HKO_MAXT_ALL.csv, rows of December 1986 | The maximum of 16.6 °C on 19 and 20 December 1986 was the lowest daily maximum of December 1986. The highest was 22.9 °C, on Sunday 14 December (the day before the model week) and again on Thursday 25 December. | "1986,12,14,22.9,C" |
| daily_HKO_RF_ALL.csv, rows of December 1986 | The total rainfall of December 1986 at the Observatory headquarters was 46.6 mm (sum of the 31 rows). Most of it fell on 3 December (35.2 mm). Other rain days: 2 Dec 2.1 mm, 7 Dec 1.5 mm, 18 Dec 1.3 mm, 26 Dec 5.1 mm, 27 Dec 1.4 mm; trace on 6, 15, 16 and 17 Dec. | "1986,12,3,35.2,C" |
| daily_KP_SUN_ALL.csv, rows of December 1986 | The total bright sunshine at King's Park in December 1986 was 178.1 hours (sum of the 31 rows). The sunniest day was 28 December with 9.8 hours; 2, 3, 17, 18 and 26 December had none. | "1986,12,28,9.8,C" |
| daily_HKO_RH_ALL.csv, rows 1986,12,18-19 | The relative humidity of the model week was highest on Thursday 18 December (84%) and fell to 55% on Friday 19 December, the lowest of the week. | "1986,12,19,55,C" |
### services-9: Hong Kong Observatory Open Data

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), "Hong Kong Observatory Open Data", web page, no date of revision on the page, https://www.hko.gov.hk/en/abouthko/opendata_intro.htm. Retrieved 2026-11-19.
- **Class:** secondary (A finding aid of 2026: a list of links to present-day datasets. It records nothing of 1986, thus it belongs in secondary-sources/ (or only as a reference note of the folder), not in primary-sources/.)
- **Date of the record:** 2026 (page as read on 2026-11-19)
- **Note:** the reader classed the whole item as secondary: its 6 facts are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

- **Leads:**
  - Gregorian-Lunar calendar conversion table (DATA.GOV.HK): https://data.gov.hk/en-data/dataset/hk-hko-rss-gregorian-lunar-calendar-conversion-table (for the lunar dates of 15-22 Dec 1986; not opened)
  - Times of sunrise, sun transit, sunset (DATA.GOV.HK): https://data.gov.hk/en-data/dataset/hk-hko-rss-times-of-sunrise-suntransit-sunset (not opened; it is unknown if it reaches 1986)
  - HKO terms of use: https://www.hko.gov.hk/en/readme/readme.htm (read for the licence of top-services-1)
### services-6: Daily Mean Pressure (hPa) at the Hong Kong Observatory (日平均氣壓(百帕斯卡) - 天文台)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Mean Pressure (hPa) at the Hong Kong Observatory' (日平均氣壓(百帕斯卡) - 天文台), CSV file, series 1884-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily mean pressure'. https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MSLP_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - not downloaded (curl exit 16): Daily mean pressure, HKO headquarters, 1884-2026. CSV, 938460 bytes, sha256 af7ee0c47276f7ce233127c902be15b575ecf13fe5e6a8e836b103153c744168 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_MSLP_ALL.csv; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_HKO_MSLP_ALL.csv, row 1986,12,15,1018.5,C | The mean pressure at the Hong Kong Observatory headquarters on Monday 15 December 1986 was 1018.5 hPa (flag C). | "1986,12,15,1018.5,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,16,1019.6,C | The mean pressure at the Hong Kong Observatory headquarters on Tuesday 16 December 1986 was 1019.6 hPa (flag C). | "1986,12,16,1019.6,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,17,1019.6,C | The mean pressure at the Hong Kong Observatory headquarters on Wednesday 17 December 1986 was 1019.6 hPa (flag C). | "1986,12,17,1019.6,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,18,1021.1,C | The mean pressure at the Hong Kong Observatory headquarters on Thursday 18 December 1986 was 1021.1 hPa (flag C). | "1986,12,18,1021.1,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,19,1025.1,C | The mean pressure at the Hong Kong Observatory headquarters on Friday 19 December 1986 was 1025.1 hPa (flag C). | "1986,12,19,1025.1,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,20,1024.8,C | The mean pressure at the Hong Kong Observatory headquarters on Saturday 20 December 1986 was 1024.8 hPa (flag C). | "1986,12,20,1024.8,C" |
| daily_HKO_MSLP_ALL.csv, row 1986,12,21,1025.4,C | The mean pressure at the Hong Kong Observatory headquarters on Sunday 21 December 1986 was 1025.4 hPa (flag C). | "1986,12,21,1025.4,C" |
| daily_HKO_MSLP_ALL.csv, rows of December 1986 | The mean pressure rose by 4.0 hPa from Thursday 18 to Friday 19 December 1986 (1021.1 to 1025.1 hPa). Sunday 21 December had the highest mean pressure of the month (1025.4 hPa); Sunday 14 December had the lowest (1017.8 hPa). | "1986,12,21,1025.4,C" |
### services-8: Daily Total Evaporation (mm) at King's Park (日總蒸發量(毫米) - 京士柏)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Total Evaporation (mm) at King's Park' (日總蒸發量(毫米) - 京士柏), CSV file, series 1968-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily total evaporation'. https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_EVAP_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-8-daily_KP_EVAP_ALL.csv` (in `local/`, not in git): Daily total evaporation, King's Park, 1968-2026. CSV, 343001 bytes, sha256 dc823f088d753783fbcbd0d000bf3f1e48dd42deb63401804eac49c04c9c1395 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/KP/ALL/daily_KP_EVAP_ALL.csv; 343001 bytes; SHA-256 `dc823f088d753783fbcbd0d000bf3f1e48dd42deb63401804eac49c04c9c1395`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_KP_EVAP_ALL.csv, row 1986,12,15,3.9,C | The total evaporation at King's Park (京士柏) on Monday 15 December 1986 was 3.9 mm (flag C). | "1986,12,15,3.9,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,16,1.5,C | The total evaporation at King's Park (京士柏) on Tuesday 16 December 1986 was 1.5 mm (flag C). | "1986,12,16,1.5,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,17,1.2,C | The total evaporation at King's Park (京士柏) on Wednesday 17 December 1986 was 1.2 mm (flag C). | "1986,12,17,1.2,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,18,1.5,C | The total evaporation at King's Park (京士柏) on Thursday 18 December 1986 was 1.5 mm (flag C). | "1986,12,18,1.5,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,19,3.7,C | The total evaporation at King's Park (京士柏) on Friday 19 December 1986 was 3.7 mm (flag C). | "1986,12,19,3.7,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,20,2.0,C | The total evaporation at King's Park (京士柏) on Saturday 20 December 1986 was 2.0 mm (flag C). | "1986,12,20,2.0,C" |
| daily_KP_EVAP_ALL.csv, row 1986,12,21,3.5,C | The total evaporation at King's Park (京士柏) on Sunday 21 December 1986 was 3.5 mm (flag C). | "1986,12,21,3.5,C" |
| daily_KP_EVAP_ALL.csv, rows of December 1986 | The total evaporation at King's Park in December 1986 was 77.3 mm (sum of the 31 rows). | "1986,12,15,3.9,C" |
### services-16: Daily Grass Minimun Temperature (°C) at the Hong Kong Observatory (日平均草溫(攝氏度) - 天文台)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hong Kong Observatory (香港天文台), then the Royal Observatory, Hong Kong, 'Daily Grass Minimun Temperature (°C) at the Hong Kong Observatory' [sic] (日平均草溫(攝氏度) - 天文台), CSV file, series 1968-2026, rows 1986,12,15 to 1986,12,21. DATA.GOV.HK dataset 'Daily grass minimum temperature'. https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_GMT_ALL.csv. Retrieved 2026-11-19.
- **Class:** primary (Daily observations made at the time by the Royal Observatory, Hong Kong (now the Hong Kong Observatory). The CSV is a present-day compilation of the record; each value of the model week carries the flag C (data complete). The values can have had quality control after 1986 (INFERRED: the file does not say). It stays in primary-sources/.)
- **Date of the record:** daily observations of 15-21 December 1986 (file as served on 2026-11-19)
- **Files:**
  - `services-16-daily_HKO_GMT_ALL.csv` (in `local/`, not in git): Daily grass minimum temperature, HKO, 1968-2026. CSV, 363472 bytes, sha256 bc642c3bf3011e97514448e1f26138f4b603c16ab91d05c139f5ab25472cc5c5 as read on 2026-11-19; the file grows each month, thus a later copy has another checksum.; https://data.weather.gov.hk/weatherAPI/cis/csvfile/HKO/ALL/daily_HKO_GMT_ALL.csv; 363472 bytes; SHA-256 `bc642c3bf3011e97514448e1f26138f4b603c16ab91d05c139f5ab25472cc5c5`; licence: DATA.GOV.HK Terms and Conditions, Version 1.2 (last updated 26 May 2025): the Data can be used "for both commercial and non-commercial purposes on a free-of-charge basis", with a clear statement of the source and acknowledgement of the Government. No named open licence (not CC BY, not CC0). (https://data.gov.hk/en/terms-and-conditions)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/hko-weather-1986-1992/SOURCE.md`](../../secondary-sources/hko-weather-1986-1992/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| daily_HKO_GMT_ALL.csv, row 1986,12,15,13.9,C | The grass minimum temperature at the Hong Kong Observatory on Monday 15 December 1986 was 13.9 °C (flag C). | "1986,12,15,13.9,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,16,15.4,C | The grass minimum temperature at the Hong Kong Observatory on Tuesday 16 December 1986 was 15.4 °C (flag C). | "1986,12,16,15.4,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,17,15.7,C | The grass minimum temperature at the Hong Kong Observatory on Wednesday 17 December 1986 was 15.7 °C (flag C). | "1986,12,17,15.7,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,18,16.5,C | The grass minimum temperature at the Hong Kong Observatory on Thursday 18 December 1986 was 16.5 °C (flag C). | "1986,12,18,16.5,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,19,7.7,C | The grass minimum temperature at the Hong Kong Observatory on Friday 19 December 1986 was 7.7 °C (flag C). | "1986,12,19,7.7,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,20,7.6,C | The grass minimum temperature at the Hong Kong Observatory on Saturday 20 December 1986 was 7.6 °C (flag C). | "1986,12,20,7.6,C" |
| daily_HKO_GMT_ALL.csv, row 1986,12,21,8.9,C | The grass minimum temperature at the Hong Kong Observatory on Sunday 21 December 1986 was 8.9 °C (flag C). | "1986,12,21,8.9,C" |
| daily_HKO_GMT_ALL.csv and daily_HKO_MINT_ALL.csv, rows 1986,12,19-21 | INFERRED: The values are a night minimum, not a daily mean: on 19-21 December 1986 they (7.7, 7.6, 8.9 °C) are below the minimum air temperature (10.1, 11.7, 13.0 °C). 7.6 °C on Saturday 20 December was the lowest of December 1986. | "1986,12,20,7.6,C" |
