const { getSpreadsheetData } = require("./modules/excel-helpers");
const fs = require("fs");

const SRC_PATH = "/../source-dreams-news";
const BASELINES_PATH = `${SRC_PATH}/baselines.xlsx`;
const EXCEL_DATA_RANGE = {
  firstRow: 5,
  lastRow: 59,
  sheetIndex: 0,
};

const replaceLabels = {
  "Male references": "♂ references",
  "Female references": "♀ references",
  "Physical aggression": "Aggression",
};

const legends = [
  {
    name: "Baselines F",
    column: 2,
  },
  {
    name: "Baselines M",
    column: 4,
  },
  {
    name: "Mary Journal",
    column: 14,
  },
  {
    name: "Tita Journal",
    column: 18,
  },
  {
    name: "Ana Journal 2020",
    column: 6,
  },
  {
    name: "Burgess Journal",
    column: 10,
  },
  {
    name: "Rose Journal",
    column: 22,
  },
];

const palette = [
  "#eb524d",
  "#fac69a",
  "#90caca",
  "#b68a07",
  "#3e683a",
  "#40647a",
  "#2c2c2c",
];

const categories = {
  perception: ["Vision", "Hearing", "Touch", "Smell & Taste", "Color"],
  emotion: ["Fear", "Anger", "Sadness", "Wonder", "Happiness"],
  characters: [
    "Family",
    "Animals",
    "Fantastic beings",
    "Male references",
    "Female references",
  ],
  "social interactions": ["Friendliness", "Physical aggression", "Sexuality"],
  movement: ["Walking/Running", "Flying", "Falling", "Death"],
  cognition: ["Thinking", "Speech", "Reading/Writing"],
  culture: [
    "Architecture",
    "Food and Drink",
    "Clothing",
    "School",
    "Transportation",
    "Technology",
    "Money and Work",
    "Weapons",
    "Sports",
    "Art",
    "Religion",
  ],
  elements: ["Fire", "Air", "Water", "Earth"],
};

function getCategoryForItem(item) {
  const category = Object.keys(categories).find(category => {
    return categories[category].includes(item);
  });
  if (!category) {
    console.error(`No category found for item ${item}`);
    return undefined;
  }
  return category;
}

////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////

try {
  // Prep: read the photo credits excel file
  const sheetData = getSpreadsheetData(
    __dirname + BASELINES_PATH,
    EXCEL_DATA_RANGE.firstRow,
    EXCEL_DATA_RANGE.lastRow,
    EXCEL_DATA_RANGE.sheetIndex
  );

  const data = legends.map(legend => {
    // const legendData = {};

    // sheetData.map(row => {
    //   const item = row[0];
    //   console.log("xxxx", item);
    // });
    const legendData = sheetData[0].reduce((acc, row) => {
      const rawItem = row[0];
      const item = replaceLabels[rawItem] || rawItem;
      const rawValue = (1 / 100) * row[legend.column];
      const value = parseFloat(rawValue.toFixed(2));
      const category = getCategoryForItem(rawItem);

      // Sometimes a random row sneaks in if it has a weird filled cell somewhere
      if (!category) return acc;

      if (acc[category]) {
        return {
          ...acc,
          [category]: {
            ...acc[category],
            [item]: value,
          },
        };
      } else {
        return {
          ...acc,
          [category]: {
            [item]: value,
          },
        };
      }
    }, {});

    return {
      name: legend.name,
      data: legendData,
      meta: {
        color: palette[legends.indexOf(legend)],
      },
    };
  });

  // Pretty print JSON
  // it's not enough data to be worth minifying
  const jsonText = JSON.stringify(data, null, 2);
  fs.writeFileSync(__dirname + "/../public/data/baselines.json", jsonText);
} catch (err) {
  console.error(err);
}
