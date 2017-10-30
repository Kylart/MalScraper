const official = require('./officialApi')
const getSeason = require('./seasons.js')
const getNewsNoDetails = require('./news')
const info = require('./info')

module.exports = {
  official,
  getSeason,
  getNewsNoDetails,
  ...info
}
