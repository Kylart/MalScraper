const officialApi = require('./officialApi')
const getSeason = require('./seasons.js')
const getNewsNoDetails = require('./news')
const {getInfoFromName, getInfoFromURL, getResultsFromSearch} = require('./info')
const {getWatchListFromUser} = require('./watchList')

module.exports = {
  officialApi,
  getSeason,
  getNewsNoDetails,
  getInfoFromName,
  getInfoFromURL,
  getResultsFromSearch,
  getWatchListFromUser
}
