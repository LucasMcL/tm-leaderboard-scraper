import * as puppeteer from 'puppeteer';
import { removeDuplicates, writeAsCsv, writeAsJson } from './util';

const url = 'https://account.asmodee.net/en/game/TerraformingMars/rankings';

// treating everything as strings
export interface PlayerData {
  rank: string;
  player: string;
  score: string;
  gamesPlayed: string;
}

const getPlayersFromTable = async (
  page: puppeteer.Page,
): Promise<PlayerData[]> => {
  const players = await page.evaluate(async () => {
    const table = document.querySelector('tbody');

    const parseRow = (row: HTMLTableRowElement): PlayerData => {
      const tds = row.querySelectorAll('td');
      if (tds.length !== 4) throw new Error('Unexpected row structure');
      return {
        rank: tds[0].innerHTML,
        player: tds[1].innerHTML,
        score: tds[2].innerHTML,
        gamesPlayed: tds[3].innerHTML,
      };
    };

    const scrapeTable = (table: HTMLTableSectionElement): PlayerData[] => {
      const visibleRows = table.querySelectorAll('tr');

      const players = [];
      visibleRows.forEach((row) => players.push(parseRow(row)));
      return players;
    };

    return scrapeTable(table);
  });
  return players;
};

const getNextPageBtn = async (
  page: puppeteer.Page,
): Promise<puppeteer.ElementHandle<Element>> => {
  return await page.$('li.page-item.next');
};

const getIsNextPage = async (page: puppeteer.Page): Promise<boolean> => {
  const isNextPage = await page.evaluate(async () => {
    const nextBtn = document.querySelector('li.page-item.next');
    const classes = nextBtn.classList;
    const isDisabled = classes.contains('disabled');
    return !isDisabled;
  });
  return isNextPage;
};

async function scrape(): Promise<PlayerData[]> {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody');
    const allPlayers: PlayerData[] = [];

    allPlayers.push(...(await getPlayersFromTable(page)));

    let isNextPage = true;
    while (isNextPage) {
      const nextPageBtn = await getNextPageBtn(page);
      await nextPageBtn.click();
      const visiblePlayers = await getPlayersFromTable(page);
      allPlayers.push(...visiblePlayers);
      await page.waitForTimeout(250);
      isNextPage = await getIsNextPage(page);
      console.log(`${allPlayers.length} players scraped.`);
    }

    // Something is wrong with the while loop and it's failing to pick up the last page of players
    // Adding this for now...but something is fishy...
    await page.waitForTimeout(1000);
    allPlayers.push(...(await getPlayersFromTable(page)));

    return allPlayers;
  } catch (e) {
    console.error(e);
  }
}

scrape()
  .then(async (players) => {
    const filteredPlayers = removeDuplicates(players);
    console.log(`total filtered player count: ${filteredPlayers.length}`);
    await writeAsCsv(filteredPlayers);
    writeAsJson(filteredPlayers);
  })
  .catch(console.error)
  .finally(() => process.exit());
