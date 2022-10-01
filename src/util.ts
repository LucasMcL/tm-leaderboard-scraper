import * as fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { PlayerData } from '.';

enum FileType {
  Csv = '.csv',
  Json = '.json',
}

const getFilePath = (fileType: FileType) => {
  const date = new Date().toISOString().split('T')[0];
  const fileName = `${date}_tm-leaderboard${fileType}`;
  return `data/${fileName}`;
};

const csvWriter = createCsvWriter({
  path: getFilePath(FileType.Csv),
  append: false,
  header: [
    { id: 'rank', title: 'Rank' },
    { id: 'player', title: 'Player' },
    { id: 'score', title: 'Score' },
    { id: 'gamesPlayed', title: 'Games Played' },
  ],
});

export const writeAsCsv = async (playerData: PlayerData[]): Promise<void> => {
  try {
    await csvWriter.writeRecords(playerData);
    console.log(`Player data written to ${getFilePath(FileType.Csv)}`);
  } catch (e) {
    console.error('Error writing csv file', e);
  }
};

export const writeAsJson = (playerData: PlayerData[]): void => {
  try {
    fs.writeFileSync(getFilePath(FileType.Json), JSON.stringify(playerData));
    console.log(`Player data written to ${getFilePath(FileType.Json)}`);
  } catch (e) {
    console.error('Error writing JSON file', e);
  }
};

// Sometimes if the scraping goes too fast it gets data off the same page twice
// This filters duplicates that might have been scraped
export const removeDuplicates = (playerData: PlayerData[]): PlayerData[] => {
  return playerData.filter(
    (value, i, self) =>
      i === self.findIndex((player) => player.rank === value.rank),
  );
};

export const validateResults = (filteredPlayers: PlayerData[]): void => {
  const filteredPlayerCount = filteredPlayers.length;
  const lastPlayerRank = Number(filteredPlayers[filteredPlayers.length - 1].rank);
  console.log(`total filtered player count: ${filteredPlayerCount}`);
  console.log(`rank of last scraped player: ${lastPlayerRank}`);
  if (filteredPlayerCount !== lastPlayerRank) {
    console.warn('Warning: rank of last scraped player does not match total number of scraped players.  Web scraping may have been inaccurate.');
  }
}