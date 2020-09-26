#!/usr/bin/env node

'use strict';
const { readdirSync, existsSync, writeFileSync, readFileSync } = require('fs');
const {
  getGic,
  getRegisteredGic,
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
} = require('./index');
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
  .describe('l', 'Save the JSON if content is different from the last')
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

function writeResponse(response, path) {
  const timestamp = new Date().getTime();
  try {
    writeFileSync(`${path}/${timestamp}.json`, JSON.stringify(response));
  } catch (err) {
    return err;
  }
}

function logResponse(response) {
  const path = argv.d || process.cwd();

  // if the path does not exist
  if (!existsSync(path)) {
    return new Error(`Directory "${path}" does not exist.`);
  }

  const [lastLog] = orderBy(
    readdirSync(path, { withFileTypes: true }).filter(({ name }) =>
      /.*.json/i.test(name)
    ),
    ['name'],
    ['desc']
  );

  // if there is not a previous log
  if (!lastLog) {
    return writeResponse(response, path);
  }

  // if there is a previous log
  let responseLast;
  try {
    responseLast = JSON.parse(readFileSync(`${path}/${lastLog.name}`));
  } catch (err) {
    return err;
  }

  // if the current data is identical to the previous log
  if (isEqual(orderBy(responseLast, 'id'), orderBy(response, 'id'))) {
    return;
  }

  // if the current data is different from the previous log
  return writeResponse(response, path);
}

const quiet = argv.q === true;
const page = argv.p;
let apiResponse;
switch (page) {
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
      console.error('page option must be provided');
    }
    process.exit(1);
    return;
}

apiResponse.then(
  (response) => {
    if (!quiet) {
      console.log(JSON.stringify(response));
    }

    // if skip log
    const doLog = argv.l === true;
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
