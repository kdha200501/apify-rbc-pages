const { join } = require('path');
const { readMockFile } = require('../../utils');

function getMortgageFixed() {
  return readMockFile(join(__dirname, 'fixed.html'));
}

function getMortgagePrime() {
  return readMockFile(join(__dirname, 'prime.html'));
}

function getMortgageVariable() {
  return readMockFile(join(__dirname, 'variable.html'));
}

module.exports = {
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
};
