const vm = require("vm");
const { flatten, get } = require("lodash");

// const registeredGicApi = require("./mock-api/registered-gic/api.js");
const registeredGicApi = require("./api/registered-gic/api.js");

// TODO: get term label

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
  getRegisteredGic,
};
