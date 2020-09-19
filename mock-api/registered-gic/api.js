const { join } = require("path");

const { readMockFile } = require("../../utils");

function getOfferings() {
  return readMockFile(join(__dirname, "ri.js"));
}

function getRates() {
  return readMockFile(join(__dirname, "response.json"));
}

module.exports = {
  getOfferings,
  getRates,
};
