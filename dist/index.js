"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = __importStar(require("puppeteer"));
const util_1 = require("./util");
const url = 'https://account.asmodee.net/en/game/TerraformingMars/rankings';
const getPlayersFromTable = async (page) => {
    const players = await page.evaluate(async () => {
        const table = document.querySelector('tbody');
        const parseRow = (row) => {
            const tds = row.querySelectorAll('td');
            if (tds.length !== 4)
                throw new Error('Unexpected row structure');
            return {
                rank: tds[0].innerHTML,
                player: tds[1].innerHTML,
                score: tds[2].innerHTML,
                gamesPlayed: tds[3].innerHTML,
            };
        };
        const scrapeTable = (table) => {
            const visibleRows = table.querySelectorAll('tr');
            const players = [];
            visibleRows.forEach((row) => players.push(parseRow(row)));
            return players;
        };
        return scrapeTable(table);
    });
    return players;
};
const getNextPageBtn = async (page) => {
    return await page.$('li.page-item.next');
};
const getIsNextPage = async (page) => {
    const isNextPage = await page.evaluate(async () => {
        const nextBtn = document.querySelector('li.page-item.next');
        const classes = nextBtn.classList;
        const isDisabled = classes.contains('disabled');
        return !isDisabled;
    });
    return isNextPage;
};
async function scrape() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('tbody');
        const allPlayers = [];
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
    }
    catch (e) {
        console.error(e);
    }
}
scrape()
    .then(async (players) => {
    const filteredPlayers = (0, util_1.removeDuplicates)(players);
    console.log(`total filtered player count: ${filteredPlayers.length}`);
    await (0, util_1.writeAsCsv)(filteredPlayers);
    (0, util_1.writeAsJson)(filteredPlayers);
})
    .catch(console.error)
    .finally(() => process.exit());
//# sourceMappingURL=index.js.map