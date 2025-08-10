const { getSiteData } = require('./dist/lib/siteData.js');

const site = getSiteData();

module.exports = {
  siteUrl: `https://${site.slug.replaceAll('/', '')}.com/`,
  generateRobotsTxt: true,
  outDir: './public',
};
