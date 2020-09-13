## Description

Convert data from the RBC page to a JSON

## Usage with _Express_

```shell
$ mkdir my-express-app
$ cd my-express-app
$ npm i --save express apify-rbc-pages
```

```javascript
const { getGic } = require("apify-rbc-pages");
const express = require("express");

const app = express();
const port = 3000;

app.get("/", (_, res) => getGic().then((gic) => res.json(gic)));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
```

## Usage with command line

```shell
$ npm i -g apify-rbc-pages
$ get-rbc-gic -h
Usage: get-rbc-gic [options]

Commands:
  get-rbc-gic get-rbc-gic  Convert data from the RBC page to a JSON

Options:
  --version        Show version number                                 [boolean]
  -l, --log        Save the JSON if content is different from the last [boolean]
  -q, --quiet      Do not output to stdout or stderr                   [boolean]
  -d, --directory  Specify the directory where the log is to be saved, defaults
                   to cwd                                               [string]
  -h, --help       Show help                                           [boolean]

Examples:
  get-rbc-gic  Pipe out the JSON

```
