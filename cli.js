#!/usr/bin/env node

'use strict';
const { readdirSync, existsSync, writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const {
  getGic,
  getRegisteredGic,
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
} = require('./index');
const { tabulateRegisteredGic } = require('./chart/registered-gic/tabulate');
const { tabulateGic } = require('./chart/gic/tabulate');
const { orderBy, isEqual } = require('lodash');
const { description } = require('./package.json');
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .command('apify-rbc-pages', description)
  .example(
    '$0 -p registered-gic',
    'Pipe out a JSON object for the registered GIC page'
  )
  .alias('p', 'page')
  .nargs('p', 1)
  .string('p')
  .describe('p', 'Specify which RBC page')
  .choices('p', [
    'gic',
    'registered-gic',
    'mortgage-fixed',
    'mortgage-prime',
    'mortgage-variable',
  ])
  .alias('l', 'log')
  .nargs('l', 0)
  .boolean('l')
  .describe(
    'l',
    'Save the JSON if content is different from the last, upcoming feature: plots data points on a line chart see example https://codepen.io/kdha200501/full/dyOWOEL'
  )
  .alias('d', 'directory')
  .nargs('d', 1)
  .string('d')
  .alias('q', 'quiet')
  .nargs('q', 0)
  .boolean('q')
  .describe('q', 'Do not output to stdout or stderr')
  .describe(
    'd',
    'Specify the directory where the log is to be saved, defaults to cwd'
  )
  .help('h')
  .alias('h', 'help').argv;

function writeResponse(response, writePath) {
  const timestamp = new Date().getTime();
  try {
    writeFileSync(
      join(writePath, `${timestamp}.json`),
      JSON.stringify(response)
    );
  } catch (err) {
    return err;
  }
}

function tabulateLogs(override) {
  const cwd = argv.d || process.cwd();
  const filename = 'dataTable.js';

  try {
    if (existsSync(join(cwd, filename)) && !override) {
      return;
    }
  } catch (err) {
    return err;
  }

  switch (argv.p) {
    case 'gic':
      return tabulateGic(cwd, filename);
    case 'registered-gic':
      return tabulateRegisteredGic(cwd, filename);
    default:
  }
}

function logResponse(response) {
  const cwd = argv.d || process.cwd();

  // if the path does not exist
  if (!existsSync(cwd)) {
    return new Error(`Directory "${cwd}" does not exist.`);
  }

  const [lastLog] = orderBy(
    readdirSync(cwd, { withFileTypes: true }).filter(({ name }) =>
      /.*.json/i.test(name)
    ),
    ['name'],
    ['desc']
  );

  // if there is not a previous log
  if (!lastLog) {
    return writeResponse(response, cwd) || tabulateLogs();
  }

  // if there is a previous log
  let responseLast;
  try {
    responseLast = JSON.parse(readFileSync(join(cwd, lastLog.name)));
  } catch (err) {
    return err;
  }

  // if the current data is identical to the previous log
  if (isEqual(orderBy(responseLast, 'id'), orderBy(response, 'id'))) {
    return tabulateLogs();
  }

  // if the current data is different from the previous log
  return writeResponse(response, cwd) || tabulateLogs(true);
}

const quiet = argv.q === true;
let apiResponse;
switch (argv.p) {
  case 'gic':
    apiResponse = getGic();
    break;
  case 'registered-gic':
    apiResponse = getRegisteredGic();
    break;
  case 'mortgage-fixed':
    apiResponse = getMortgageFixed();
    break;
  case 'mortgage-prime':
    apiResponse = getMortgagePrime();
    break;
  case 'mortgage-variable':
    apiResponse = getMortgageVariable();
    break;
  default:
    if (!quiet) {
      console.error(`page "${argv.p}" is not supported`);
    }
    process.exit(1);
    return;
}

apiResponse.then(
  (response) => {
    if (!quiet) {
      console.log(JSON.stringify(response));
    }

    const doLog = argv.l === true;

    // if skip log
    if (!doLog) {
      process.exit(0);
      return;
    }

    // if log
    const errLog = logResponse(response);
    if (errLog) {
      if (!quiet) {
        console.error(errLog);
      }
      process.exit(1);
    }

    process.exit(0);
  },
  (err) => {
    // if API has error
    if (quiet) {
      console.error(err);
    }
    process.exit(1);
  }
);
