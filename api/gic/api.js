const { fetch } = require('../../utils');

const urlRates = 'https://contact.rbc.com/gicrates/index.php';

function getGic() {
  return fetch(urlRates);
}

module.exports = {
  getGic,
};
