const { readFile } = require("fs");
const { join } = require("path");

function _readMockFromFile(filename) {
  return new Promise((resolve, reject) => {
    readFile(join(__dirname, filename), "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function getMortgageFixed() {
  return _readMockFromFile("fixed.html");
}

function getMortgagePrime() {
  return _readMockFromFile("prime.html");
}

function getMortgageVariable() {
  return _readMockFromFile("variable.html");
}

module.exports = {
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
};
