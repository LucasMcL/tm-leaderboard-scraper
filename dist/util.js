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
exports.removeDuplicates = exports.writeAsJson = exports.writeAsCsv = void 0;
const fs = __importStar(require("fs"));
const csv_writer_1 = require("csv-writer");
var FileType;
(function (FileType) {
    FileType["Csv"] = ".csv";
    FileType["Json"] = ".json";
})(FileType || (FileType = {}));
const getFilePath = (fileType) => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${date}_tm-leaderboard${fileType}`;
    return `data/${fileName}`;
};
const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
    path: getFilePath(FileType.Csv),
    append: false,
    header: [
        { id: 'rank', title: 'Rank' },
        { id: 'player', title: 'Player' },
        { id: 'score', title: 'Score' },
        { id: 'gamesPlayed', title: 'Games Played' },
    ],
});
const writeAsCsv = async (playerData) => {
    try {
        await csvWriter.writeRecords(playerData);
        console.log(`Player data written to ${getFilePath(FileType.Csv)}`);
    }
    catch (e) {
        console.error('Error writing csv file', e);
    }
};
exports.writeAsCsv = writeAsCsv;
const writeAsJson = (playerData) => {
    try {
        fs.writeFileSync(getFilePath(FileType.Json), JSON.stringify(playerData));
        console.log(`Player data written to ${getFilePath(FileType.Json)}`);
    }
    catch (e) {
        console.error('Error writing JSON file', e);
    }
};
exports.writeAsJson = writeAsJson;
// Sometimes if the scraping goes too fast it gets data off the same page twice
// This filters duplicates that might have been scraped
const removeDuplicates = (playerData) => {
    return playerData.filter((value, i, self) => i === self.findIndex((player) => player.rank === value.rank));
};
exports.removeDuplicates = removeDuplicates;
//# sourceMappingURL=util.js.map