const fs = require("fs");
const path = require("path");
import { SheldonRecordSet } from "@kannydennedy/dreams-2020-types";
const { convertSheldonRecordToComparisonSet } = require("./modules/type-conversions");

// Check if file is a dot file
const isDotPath = (filePath: string): boolean => {
  return filePath.split("/").some(part => part.startsWith("."));
};

// Open all the files in "../source-data" one by one
// and combine them in memory
const files = fs.readdirSync(path.join(__dirname, "../source-data"));
const data = files.reduce((acc: object, file: any) => {
  const filePath = path.join(__dirname, "../source-data", file);
  const fileData = fs.readFileSync(filePath, "utf8");

  if (isDotPath(filePath)) {
    return acc;
  } else {
    const parsedFileData: SheldonRecordSet = JSON.parse(fileData);
    const comparisonSets = parsedFileData.records.map(
      convertSheldonRecordToComparisonSet
    );
    return {
      ...acc,
      ...comparisonSets,
    };
  }
}, []);

// Now write all the data to a big new file
fs.writeFileSync(
  path.join(__dirname, "../real-data.json"),
  JSON.stringify(data, null, 2),
  "utf8"
);

export {};
