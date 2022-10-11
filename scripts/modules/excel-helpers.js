const XLSX = require("xlsx");

const getExcelWorksheet = (excelFilePath, sheetIndex) => {
  const workbook = readExcelFile(excelFilePath);
  const first_sheet_name = workbook.SheetNames[sheetIndex];
  return workbook.Sheets[first_sheet_name];
};

const readExcelFile = excelFilePath => {
  return XLSX.readFile(excelFilePath);
};

const getWorksheetRows = (worksheet, firstDataRow, lastDataRow) => {
  const rawRows = getRawWorksheetRows(worksheet, firstDataRow, lastDataRow);
  if (!rawRows) return null;
  const nonEmptyRows = rawRows.filter(row => row.length > 1);
  return nonEmptyRows;
};

const getRawWorksheetRows = (worksheet, firstDataRow, lastDataRow) => {
  if (!worksheet) return null;
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    range: firstDataRow,
    header: 1,
  });
  const rowsToReturn = rows.filter((row, i) => {
    if (lastDataRow) {
      // Since first data row is calculated in relation to the whole sheet
      // And last data row in relation to sheet - header
      return i <= lastDataRow - firstDataRow;
    } else {
      return row;
    }
  });
  return rowsToReturn;
};

const getTextWorksheetRows = (worksheet, firstDataRow, lastDataRow) => {
  if (!worksheet) return null;
  const txt = XLSX.utils.sheet_to_txt(worksheet, {
    range: firstDataRow,
    header: 1,
  });
  return txt;
};

const getSpreadsheetData = (
  excelFilePath,
  firstDataRow,
  lastDataRow,
  sheetIndex,
  firstDataColumn,
  lastDataColumn
) => {
  // Get the sheet itself
  const worksheet = getExcelWorksheet(excelFilePath, sheetIndex);

  // Trim the required rows from the sheet
  const worksheetRows = getWorksheetRows(worksheet, firstDataRow, lastDataRow);

  // Trim columns
  // E.g. we might need to transpose, and there's extraneous data around
  const trimmedRows = trimToColumns(worksheetRows, firstDataColumn, lastDataColumn);

  return [trimmedRows];
};

const trimToColumns = (worksheetRows, firstDataColumn, lastDataColumn) => {
  if (firstDataColumn === undefined || lastDataColumn === undefined) {
    return worksheetRows;
  } else {
    return worksheetRows.map(row => {
      return row.slice(firstDataColumn, lastDataColumn + 1);
    });
  }
};

// Takes a table (array of rows) and returns a table with empty columns removed
const removeEmptyColumns = rows => {
  const tableWidth = getTableWidth(rows);
  const nonEmptyCols = [];

  // Pad array with 'false'
  for (let i = 0; i < tableWidth; i++) {
    nonEmptyCols[i] = false;
  }

  // Find out which cols are empty
  // Map() doesn't work for undefined values in an array, hence this
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < tableWidth; j++) {
      const cell = row[j];
      if (!(cell === undefined)) {
        nonEmptyCols[j] = true;
      }
    }
  }

  // Now return the rows, but with the empty col deleted
  const ret = [];
  for (let i = 0; i < rows.length; i++) {
    ret[i] = [];
    const row = rows[i];
    for (let j = 0; j < tableWidth; j++) {
      const cell = row[j];
      if (nonEmptyCols[j]) {
        ret[i].push(cell);
      }
    }
  }

  return ret;
};

const getTableWidth = arrayOfRows => {
  const lengths = arrayOfRows.map(a => a.length);
  const maxLen = Math.max(...lengths);
  return maxLen;
};

module.exports = {
  getSpreadsheetData,
  readExcelFile,
  getWorksheetRows,
  getRawWorksheetRows,
  removeEmptyColumns,
  getTextWorksheetRows,
};
