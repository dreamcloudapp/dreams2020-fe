import {
  SingleTextRecord,
  SingleTextRecordDictionary,
} from "@kannydennedy/dreams-2020-types";
import { ukDateStringToDate } from "./modules/time-helpers";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Read CSV file and convert to JSON
// (source-dreams-news/all-dreams-final.csv)

type DreamCsvRow = {
  ID: string;
  Title: string;
  Date: string;
  Dream: string;
  Dreamer: string;
};

const DREAM_MAX_LEN = 2000;

const DREAMS_FILE_PATH = "../source-dreams-news/all-dreams-final-2020.csv";
const dreamsFile = path.join(__dirname, DREAMS_FILE_PATH);

const DREAMS_JSON_PATH = "../public/data/all-dreams-final.json";
const dreamsJsonPath = path.join(__dirname, DREAMS_JSON_PATH);

const results: DreamCsvRow[] = [];

fs.createReadStream(dreamsFile)
  .pipe(csv())
  .on("data", (data: DreamCsvRow) => results.push(data))
  .on("end", () => {
    // console.log(results.slice(0, 5));
    console.log("Parsed CSV file");

    // Turn into an array of SingleTextRecord
    const dreams: SingleTextRecord[] = results.map(dream => {
      const isLongDream = dream.Dream.length > DREAM_MAX_LEN;
      const clippedDream = isLongDream
        ? dream.Dream.slice(0, DREAM_MAX_LEN) + " (...)"
        : dream.Dream;

      return {
        id: dream.ID, // Todo: change to DreamId
        text: clippedDream,
        date: ukDateStringToDate(dream.Date),
      };
    });

    // Key by id
    const dreamsById: SingleTextRecordDictionary = dreams.reduce((acc, dream) => {
      return {
        ...acc,
        [dream.id]: dream,
      };
    }, {} as SingleTextRecordDictionary);

    // Write JSON file

    console.log("Writing JSON file");

    fs.writeFileSync(dreamsJsonPath, JSON.stringify(dreamsById, null, 2));
  });
