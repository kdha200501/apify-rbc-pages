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