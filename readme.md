## Description

Convert data from the RBC page to a JSON

## Usage with _Express_

```shell
$ mkdir my-express-app
$ cd my-express-app
$ npm i --save express apify-rbc-pages
```

```javascript
const { getRegisteredGic } = require("apify-rbc-pages");
const express = require("express");

const app = express();
const port = 3000;

app.get("/registered-gic", (_, res) => getRegisteredGic().then((registeredGic) => res.json(registeredGic)));

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
  apify-rbc-pages apify-rbc-pages  Convert data from the RBC page to a JSON

Options:
  --version        Show version number                                 [boolean]
  -p, --page       Specify which RBC page   [string] [choices: "registered-gic"]
  -l, --log        Save the JSON if content is different from the last [boolean]
  -q, --quiet      Do not output to stdout or stderr                   [boolean]
  -d, --directory  Specify the directory where the log is to be saved, defaults
                   to cwd                                               [string]
  -h, --help       Show help                                           [boolean]

Examples:
  apify-rbc-pages -p registered-gic  Pipe out a JSON object for the registered

```
