const {
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} = require('fs');
const { join, dirname } = require('path');

function listJsonFiles(readPath) {
  return readdirSync(readPath, {
    withFileTypes: true,
  })
    .filter(({ name }) => /.*.json$/i.test(name))
    .map(({ name }) => {
      const [_, timestamp] = name.match(/^(.*).json$/);
      return [Number(timestamp), join(readPath, name)];
    });
}

function readJsonFile(readPath) {
  return JSON.parse(readFileSync(readPath));
}

function tabulateMortgageFixed(cwd, filename) {
  // load all mortgages across all time
  const mortgages = listJsonFiles(cwd).reduce((acc, [timestamp, jsonFile]) => {
    const _mortgages = readJsonFile(jsonFile).map((mortgage) => {
      let rate = parseFloat(mortgage.Rate.replace(/[^\d|\.]/g, ''));

      return {
        title: mortgage.Term,
        timestamp,
        rate: isNaN(rate) ? null : rate,
      };
    });

    return [...acc, ..._mortgages];
  }, []);

  // console.table(mortgages)

  // gather unique dates and titles
  const titleSet = new Set();
  const timestampSet = new Set();
  for (const { timestamp, title } of mortgages) {
    titleSet.add(title);
    timestampSet.add(timestamp);
  }

  // gather rows for every mortgage title
  const rows = [];
  const timestamps = [...timestampSet].sort((a, b) => a - b);

  for (const _timestamp of timestamps) {
    const row = [...titleSet]
      .map((_title) =>
        mortgages.find(
          ({ timestamp, title }) => title === _title && timestamp === _timestamp
        )
      )
      .map((mortgage) => (mortgage ? mortgage.rate : null));
    rows.push(row);
  }

  // export data table
  const dataTableColumns = [
    ['date', ''],
    ...[...titleSet].map((title) => ['number', title]),
  ];
  const dataTableRows = rows.map((row, idx) => [
    new Date(timestamps[idx]),
    ...row,
  ]);

  const exportContent = `dataTableColumns = ${JSON.stringify(
    dataTableColumns
  )}; dataTableRows = ${JSON.stringify(
    dataTableRows
  )}; title = "Fixed mortgage rates"; subtitle = "in percentage"`;

  try {
    writeFileSync(join(cwd, filename), exportContent);
  } catch (err) {
    return err;
  }

  // provide presentation layer
  try {
    copyFileSync(
      join(dirname(__dirname), 'chart.html'),
      join(cwd, 'chart.html')
    );
  } catch (err) {
    return err;
  }
}

module.exports = { tabulateMortgageFixed };
