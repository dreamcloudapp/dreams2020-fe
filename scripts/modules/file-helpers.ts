const fs = require("fs");

// Check if file is a dot file
export const isDotFile = (filePath: string): boolean => {
  return filePath.split("/").some(part => part.startsWith("."));
};

// Check if a file is empty
export const isEmptyFile = (filePath: string): boolean => {
  return fs.readFileSync(filePath, "utf8").length === 0;
};
