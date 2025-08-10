const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000;
const siteDir = process.env.SITE_DIR;

if (!siteDir) {
  console.error('SITE_DIR environment variable is required');
  process.exit(1);
}

const app = express();
app.use(express.static(path.resolve(siteDir)));

app.listen(port, () => {
  console.log(
    `Static server running at http://localhost:${port}, serving ${siteDir}`,
  );
});
