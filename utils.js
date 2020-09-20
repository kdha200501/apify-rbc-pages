const { readFile } = require('fs');
const https = require('https');
const { load, html } = require('cheerio');
const { chunk, zipObject, sortBy, times, constant } = require('lodash');

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

function loadAsXml(_html) {
  return load(_html, {
    xmlMode: true,
  });
}

function extractCellSpan($) {
  // tODO: find a better way to extract the first root level element
  const cellElement = $('*');
  return {
    colSpan:
      cellElement.attr('colspan') && parseInt(cellElement.attr('colspan'), 10),
    rowSpan:
      cellElement.attr('rowspan') && parseInt(cellElement.attr('rowspan'), 10),
    cellText: $.text(),
  };
}

function expandCol(cells) {
  const idx = cells.findIndex(({ colSpan }) => Boolean(colSpan) && colSpan > 1);

  return idx === -1
    ? cells
    : [
        ...cells.slice(0, idx),
        ...times(
          cells[idx].colSpan,
          constant({
            ...cells[idx],
            colSpan: 1,
          })
        ),
        ...expandCol(cells.slice(idx + 1, cells.length)),
      ];
}

function expandRow(cells, cols) {
  const idx = cells.findIndex(({ rowSpan }) => Boolean(rowSpan) && rowSpan > 1);

  if (idx === -1) {
    return cells;
  }

  const [cell, ..._cells] = cells.slice(idx, cells.length);
  cell.rowSpan -= 1;
  _cells.splice(cols - 1, 0, cell);
  return [...cells.slice(0, idx), cell, ...expandRow(_cells, cols)];
}

function extractTable($) {
  const hasThead = $('thead').length > 0;

  const keyCells = Array.from(
    $(hasThead ? 'thead th' : 'tr:first-of-type td, tr:first-of-type th')
  )
    .map(html)
    .map(load)
    .map((_$) => _$.text().replace(regexpNewLine, '').trim());

  if (keyCells.length === 0) {
    return [];
  }

  let valueCells = Array.from(
    $(
      hasThead
        ? 'tbody td'
        : 'tr:not(:first-of-type) td, tr:not(:first-of-type) th'
    )
  )
    .map(html)
    .map(loadAsXml)
    .map(extractCellSpan);

  valueCells = expandRow(
    expandCol(valueCells),
    keyCells.length
  ).map(({ cellText }) => cellText.replace(regexpNewLine, '').trim());

  if (valueCells.length === 0) {
    return [];
  }

  return [keyCells, ...chunk(valueCells, keyCells.length)];
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
