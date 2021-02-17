## Description

Convert data on the RBC page of choice to a JSON

## Usage with _Express_

```shell
$ mkdir my-express-app
$ cd my-express-app
$ npm i --save express apify-rbc-pages
```

```javascript
const {
  getGic,
  getRegisteredGic,
  getMortgageFixed,
  getMortgagePrime,
  getMortgageVariable,
} = require("apify-rbc-pages");
const express = require("express");

const app = express();
const port = 3000;

app.get("/gic", (_, res) =>
  getGic().then((apifyRes) => res.json(apifyRes))
);
app.get("/registered-gic", (_, res) =>
  getRegisteredGic().then((apifyRes) => res.json(apifyRes))
);
app.get("/mortgage-fixed", (_, res) =>
  getMortgageFixed().then((apifyRes) => res.json(apifyRes))
);
app.get("/mortgage-prime", (_, res) =>
  getMortgagePrime().then((apifyRes) => res.json(apifyRes))
);
app.get("/mortgage-variable", (_, res) =>
  getMortgageVariable().then((apifyRes) => res.json(apifyRes))
);

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
```

## Usage with command line

```shell
$ npm i -g apify-rbc-pages
$ apify-rbc-pages -h
Usage: apify-rbc-pages [options]

Commands:
  apify-rbc-pages apify-rbc-pages  Convert data on the RBC page of choice to a
                                   JSON

Options:
  --version        Show version number                                 [boolean]
  -p, --page       Specify which RBC page
                   [string] [choices: "gic", "registered-gic", "mortgage-fixed",
                                          "mortgage-prime", "mortgage-variable"]
  -l, --log        Save the JSON if content is different from the last, upcoming
                   feature: plots data points on a line chart see example
                   https://codepen.io/kdha200501/full/dyOWOEL          [boolean]
  -q, --quiet      Do not output to stdout or stderr                   [boolean]
  -d, --directory  Specify the directory where the log is to be saved, defaults
                   to cwd                                               [string]
  -h, --help       Show help                                           [boolean]

Examples:
  apify-rbc-pages -p registered-gic  Pipe out a JSON object for the registered
                                     GIC page
```
