const officialApi = require('./officialApi')
const getSeason = require('./seasons.js')
const getNewsNoDetails = require('./news')
const info = require('./info')
const watchList = require('./watchList')

module.exports = {
  officialApi,
  getSeason,
  getNewsNoDetails,
  ...info,
  ...watchList
}
