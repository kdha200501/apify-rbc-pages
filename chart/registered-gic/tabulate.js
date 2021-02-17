const {
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} = require('fs');
const { join } = require('path');

function listJsonFiles(readPath) {
  return readdirSync(readPath, {
    withFileTypes: true,
  })
    .filter(({ name }) => /.*.json$/i.test(name))
    .map(({ name }) => join(readPath, name));
}

function readJsonFile(readPath) {
  return JSON.parse(readFileSync(readPath));
}

function parseDate(dateStr) {
  const [_, year, month, date] = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  const utcDate = new Date();
  utcDate.setUTCFullYear(Number(year));
  utcDate.setUTCMonth(Number(month) - 1);
  utcDate.setUTCDate(Number(date));
  utcDate.setUTCHours(0);
  utcDate.setUTCMinutes(0);
  utcDate.setUTCSeconds(0);
  utcDate.setUTCMilliseconds(0);
  return utcDate;
}

function formatDate(utcDate) {
  const year = utcDate.getUTCFullYear();
  const month = `0${utcDate.getUTCMonth() + 1}`.substr(-2, 2);
  const day = `0${utcDate.getUTCDate()}`.substr(-2, 2);

  return `${year}${month}${day}`;
}

function tabulateRegisteredGic(cwd, filename) {
  // load all GICs across all time
  let gics;

  try {
    gics = listJsonFiles(cwd).reduce(
      (acc, jsonFile) => [...acc, ...readJsonFile(jsonFile)],
      []
    );
  } catch (err) {
    return err;
  }

  if (gics.length === 0) {
    return;
  }

  // map GIC ID to label and term, get unique effective dates
  const labelMap = new Map();
  const termMap = new Map();
  const dateSet = new Set();
  for (const { id, label, term, EffDate } of gics) {
    labelMap.set(id, label);
    termMap.set(id, term);
    dateSet.add(EffDate);
  }

  // assign each GIC ID a column title
  const [ids, titles] = [...labelMap].reduce(
    ([_ids, _titles], [id, label]) => [
      [..._ids, id],
      [..._titles, `${termMap.get(id)} ${label}`],
    ],
    [[], []]
  );

  // gather rows for every GIC ID
  const rows = [];
  const dates = [...dateSet].map(parseDate).sort((a, b) => a - b);
  for (const date of dates) {
    const gicEffDate = formatDate(date);
    const row = ids
      .map((gicId) =>
        gics.find(({ id, EffDate }) => id === gicId && EffDate === gicEffDate)
      )
      .map((gic, idx) => {
        if (gic !== undefined && gic !== null) {
          return Number(gic.Value);
        }
        const lastRow = rows.length > 0 ? rows[rows.length - 1] : [];
        const previousValue = lastRow[idx];
        if (previousValue !== undefined && previousValue !== null) {
          return Number(previousValue);
        }
        return null;
      });
    rows.push(row);
  }

  // export data table
  const dataTableColumns = [
    ['date', ''],
    ...titles.map((title) => ['number', title]),
  ];
  const dataTableRows = rows.map((row, idx) => [dates[idx], ...row]);

  const exportContent = `dataTableColumns = ${JSON.stringify(
    dataTableColumns
  )}; dataTableRows = ${JSON.stringify(
    dataTableRows
  )}; title = "Registered GIC interest rates"; subtitle = "in percentage"`;

  try {
    writeFileSync(join(cwd, filename), exportContent);
  } catch (err) {
    return err;
  }

  // provide presentation layer
  try {
    copyFileSync(join(__dirname, 'chart.html'), join(cwd, 'chart.html'));
  } catch (err) {
    return err;
  }
}

module.exports = { tabulateRegisteredGic };
