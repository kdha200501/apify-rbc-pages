const fs = require("fs");
const { join } = require("path");

function getOfferings() {
  return new Promise((resolve, reject) => {
    fs.readFile(join(__dirname, "ri.js"), "utf8", (err, contents) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(contents);
    });
  });
}

function getRates() {
  return new Promise((resolve, reject) => {
    fs.readFile(join(__dirname, "response.json"), "utf8", (err, contents) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(contents);
    });
  });
}

module.exports = {
  getOfferings,
  getRates,
};
