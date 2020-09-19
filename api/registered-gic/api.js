const https = require("https");

const urlRates =
  "https://apps.royalbank.com/uaw0/app-services/public-rates/api/publicrates?lang=en&type=ri";
const urlOfferings =
  "https://www.rbcroyalbank.com/rates/_assets-custom/js/ratesIdMapping/ri.js";

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = [];

        // a chunk of data is received
        resp.on("data", (chunk) => data.push(chunk));

        // the final chunk of data received
        resp.on("end", () => resolve(data.join("")));
      })
      .on("error", ({ message }) => reject(message));
  });
}

function getOfferings() {
  return fetch(urlOfferings);
}

function getRates() {
  return fetch(urlRates);
}

module.exports = {
  getOfferings,
  getRates,
};
