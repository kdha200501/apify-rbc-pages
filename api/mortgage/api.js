const { fetch } = require('../../utils');

const urlFixed =
  'https://www.rbcroyalbank.com/mortgages/fixed-rate-mortgage.html';
const urlPrime = 'https://www.rbcroyalbank.com/mortgages/mortgage-rates.html';
const urlVariable =
  'https://www.rbcroyalbank.com/mortgages/variable-rate-mortgage.html';

function getMortgageFixed() {
  return fetch(urlFixed);
}
function getMortgagePrime() {
  return fetch(urlPrime);
}
function getMortgageVariable() {
  return fetch(urlVariable);
}

module.exports = {
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
};
