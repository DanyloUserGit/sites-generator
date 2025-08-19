const { getSiteData } = require('./dist/lib/siteData.js');

const site = getSiteData();

module.exports = {
  siteUrl: `https://${site.domain}/`,
  generateRobotsTxt: true,
  outDir: './public',
};
