const fs = require("fs");

const generateData = async () => {
  const x = {
    name: "Dan",
    age: 30,
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
    },
  };
  return x;
};

generateData().then(data => {
  fs.writeFileSync("data.json", JSON.stringify(data));
});
