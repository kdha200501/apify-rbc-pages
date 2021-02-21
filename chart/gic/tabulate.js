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

function tabulateGic(cwd, filename) {
  // load all GICs across all time
  const gics = listJsonFiles(cwd).reduce((acc, [timestamp, jsonFile]) => {
    const _gics = readJsonFile(jsonFile).map((gic) => {
      let rate = parseFloat(gic.Rate.replace(/[^\d|\.]/g, ''));

      return {
        title: `${gic['Term Group']} - ${gic['Term to Maturity']}`,
        timestamp,
        rate: isNaN(rate) ? null : rate,
      };
    });

    return [...acc, ..._gics];
  }, []);

  // gather unique dates and titles
  const titleSet = new Set();
  const timestampSet = new Set();
  for (const { timestamp, title } of gics) {
    titleSet.add(title);
    timestampSet.add(timestamp);
  }

  // gather rows for every GIC title
  const rows = [];
  const timestamps = [...timestampSet].sort((a, b) => a - b);

  for (const _timestamp of timestamps) {
    const row = [...titleSet]
      .map((_title) =>
        gics.find(
          ({ timestamp, title }) => title === _title && timestamp === _timestamp
        )
      )
      .map((gic) => (gic ? gic.rate : null));
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
  )}; title = "GIC interest rates"; subtitle = "in percentage"`;

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

module.exports = { tabulateGic };
