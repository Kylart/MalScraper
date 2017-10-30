const official = require('./officialApi')
const getSeason = require('./seasons.js')
const getNewsNoDetails = require('./news')
const info = require('./info')
const getUserWatchList = require('./watchList')

module.exports = {
  official,
  getSeason,
  getNewsNoDetails,
  ...info,
  getUserWatchList
}
