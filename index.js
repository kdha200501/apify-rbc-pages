const vm = require('vm');
const { flatten, get } = require('lodash');
const { load, html } = require('cheerio');

// const registeredGicApi = require("./mock-api/registered-gic/api.js");
const registeredGicApi = require('./api/registered-gic/api.js');
// const mortgageApi = require("./mock-api/mortgage/api");
const mortgageApi = require('./api/mortgage/api');

const { extractTable, convertTableToJson } = require('./utils');

function getRegisteredGic() {
  return Promise.all([
    registeredGicApi.getOfferings(),
    registeredGicApi.getRates(),
  ])
    .then(([offeringsString, ratesString]) => {
      // "rates" response is a Json (in plain text)
      const rates = JSON.parse(ratesString);

      // "offerings" response is a JavaScript variable (in plain text)
      const context = {};
      const script = new vm.Script(offeringsString);
      vm.createContext(context);
      script.runInContext(context);

      const offerings = flatten(
        Object.entries(Object.values(context)[0]).map(([term, val]) =>
          val.map((offering) => ({
            ...offering,
            term,
          }))
        )
      );

      return {
        rates,
        offerings,
      };
    })
    .then(({ rates, offerings }) => {
      const offeringRateMap = get(rates, 'result_content').reduce(
        (acc, rate) => acc.set(get(rate, 'Name'), rate),
        new Map()
      );

      return offerings.map((offering) => ({
        ...offering,
        ...offeringRateMap.get(offering.id),
      }));
    });
}

function getMortgageFixed() {
  return mortgageApi
    .getMortgageFixed()
    .then(load)
    .then(($) => Array.from($('table')).pop())
    .then(html)
    .then(load)
    .then(extractTable)
    .then(convertTableToJson);
}

function getMortgagePrime() {
  return mortgageApi
    .getMortgagePrime()
    .then(load)
    .then(($) => Array.from($('#rbc-prime-rate table')).pop())
    .then(html)
    .then(load)
    .then(extractTable)
    .then(convertTableToJson);
}

function getMortgageVariable() {
  return mortgageApi
    .getMortgageVariable()
    .then(load)
    .then(($) => Array.from($('table')).shift())
    .then(html)
    .then(load)
    .then(extractTable)
    .then(convertTableToJson);
}

module.exports = {
  getRegisteredGic,
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
};
