const { readFile } = require('fs');
const https = require('https');
const { load, html } = require('cheerio');
const { chunk, zipObject, sortBy } = require('lodash');

const { regexpNewLine } = require('./const');

function readMockFile(filePath) {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = [];

        // a chunk of data is received
        resp.on('data', (chunk) => data.push(chunk));

        // the final chunk of data received
        resp.on('end', () => resolve(data.join('')));
      })
      .on('error', ({ message }) => reject(message));
  });
}

function extractTable($) {
  const hasThead = $('thead').length > 0;

  const keyCell = Array.from(
    $(hasThead ? 'thead th' : 'tr:first-of-type td, tr:first-of-type th')
  )
    .map(html)
    .map(load)
    .map((cellElement) => cellElement.text().replace(regexpNewLine, '').trim());

  if (keyCell.length === 0) {
    return [];
  }

  const valueCell = Array.from(
    $(
      hasThead
        ? 'tbody td'
        : 'tr:not(:first-of-type) td, tr:not(:first-of-type) th'
    )
  )
    .map(html)
    .map(load)
    .map((cellElement) => cellElement.text().replace(regexpNewLine, '').trim());

  if (valueCell.length === 0) {
    return [];
  }

  return [keyCell, ...chunk(valueCell, keyCell.length)];
}

function convertTableToJson([keys, ...valuesList]) {
  return sortBy(
    valuesList.map((values) => zipObject(keys, values)),
    keys.slice(0, 1)
  );
}

module.exports = {
  readMockFile,
  fetch,
  extractTable,
  convertTableToJson,
};
