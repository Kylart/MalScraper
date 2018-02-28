const officialApi = require('./officialApi')
const getSeason = require('./seasons.js')
const getNewsNoDetails = require('./news.js')
const {getInfoFromName, getInfoFromURL, getResultsFromSearch} = require('./info.js')
const {getWatchListFromUser} = require('./watchList.js')
const {getEpisodesList} = require('./episodes.js')

module.exports = {
  officialApi,
  getSeason,
  getNewsNoDetails,
  getInfoFromName,
  getInfoFromURL,
  getResultsFromSearch,
  getWatchListFromUser,
  getEpisodesList
}
