#!/usr/bin/env node

"use strict";
const { readdirSync, existsSync, writeFileSync, readFileSync } = require("fs");
const { getGic } = require("./index");
const { orderBy, isEqual } = require("lodash");
const { description } = require("./package.json");
const argv = require("yargs")
  .usage("Usage: $0 [options]")
  .command("get-rbc-gic", description)
  .example("$0", "Pipe out the JSON")
  .alias("l", "log")
  .nargs("l", 0)
  .boolean("l")
  .describe("l", "Save the JSON if content is different from the last")
  .alias("d", "directory")
  .nargs("d", 1)
  .string("d")
  .alias("q", "quiet")
  .nargs("q", 0)
  .boolean("q")
  .describe("q", "Do not output to stdout or stderr")
  .describe(
    "d",
    "Specify the directory where the log is to be saved, defaults to cwd"
  )
  .help("h")
  .alias("h", "help").argv;

function writeGic(gic, path) {
  const timestamp = new Date().getTime();
  try {
    writeFileSync(`${path}/${timestamp}.json`, JSON.stringify(gic));
  } catch (err) {
    return err;
  }
}

function logGic(gic) {
  const path = argv.d || process.cwd();

  // if the path does not exist
  if (!existsSync(path)) {
    return new Error(`Directory "${path}" does not exist.`);
  }

  const [lastLog] = orderBy(
    readdirSync(path, { withFileTypes: true }).filter(({ name }) =>
      /.*.json/i.test(name)
    ),
    ["name"],
    ["desc"]
  );

  // if there is not a previous log
  if (!lastLog) {
    return writeGic(gic, path);
  }

  // if there is a previous log
  let gicLast;
  try {
    gicLast = JSON.parse(readFileSync(`${path}/${lastLog.name}`));
  } catch (err) {
    return err;
  }

  // if the current data is identical to the previous log
  if (isEqual(orderBy(gicLast, "id"), orderBy(gic, "id"))) {
    return;
  }

  // if the current data is different from the previous log
  return writeGic(gic, path);
}

const quiet = argv.q === true;
getGic().then(
  (gic) => {

    if (!quiet) {
      console.log(JSON.stringify(gic));
    }

    // if skip log
    const doLog = argv.l === true;
    if (!doLog) {
      process.exit(0);
      return;
    }

    // if log
    const errLog = logGic(gic);
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
