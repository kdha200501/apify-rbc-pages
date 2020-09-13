const vm = require("vm");
const { flatten, get } = require("lodash");

// const { getOfferings, getRates } = require("./mock-api/api.js");
const { getOfferings, getRates } = require("./api/api.js");

function getGic() {
  return Promise.all([getOfferings(), getRates()])
    .then(([offeringsString, ratesString]) => {
      // "rates" response is a Json (in plain text)
      const rates = JSON.parse(ratesString);

      // "offerings" response is a JavaScript variable (in plain text)
      const context = {};
      const script = new vm.Script(offeringsString);
      vm.createContext(context);
      script.runInContext(context);
      const offerings = flatten(Object.values(Object.values(context)[0]));

      return {
        rates,
        offerings,
      };
    })
    .then(({ rates, offerings }) => {
      const offeringRateMap = get(rates, "result_content").reduce(
        (acc, rate) => acc.set(get(rate, "Name"), rate),
        new Map()
      );

      return offerings.map((offering) => ({
        ...offering,
        ...offeringRateMap.get(offering.id),
      }));
    });
}

module.exports = {
  getGic,
};
