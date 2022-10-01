# tm-leaderboard-scraper

## Usage

- Make sure you nave node and npm installed locally
- Run `npm i` to install packages
- Run `npm run start` to scrape data
- Data is compiled in the data folder
- A .csv and a .json file will be saved to the data/ folder

## Notes

- Webscraping is notoriously brittle.  This script could stop working if Asmodee makes even minor changes to their website.
- When the script finishes running, you will see some output in the terminal.  If the rank of the last scraped player doesn't match the total number of scraped players, then something may have gone wrong.