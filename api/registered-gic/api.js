const { fetch } = require('../../utils');

const urlRates =
  'https://apps.royalbank.com/uaw0/app-services/public-rates/api/publicrates?lang=en&type=ri';
const urlOfferings =
  'https://www.rbcroyalbank.com/rates/_assets-custom/js/ratesIdMapping/ri.js';

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
