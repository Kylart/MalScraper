const axios = require('axios')
const cheerio = require('cheerio')

const SEASON_URI = 'https://www.livechart.me/'
const maxYear = 1901 + (new Date()).getYear()
const possibleSeasons = {
  'winter': 1,
  'spring': 1,
  'summer': 1,
  'fall': 1
}

const getType = (type, uri) => {
  // Type must be something like 'tv', 'ovas' or 'movies'
  return new Promise((resolve, reject) => {
    const result = []

    axios.get(uri + type).then(({data}) => {
      const $ = cheerio.load(data)

      $('.anime-card').each(function () {
        const toPush = {}
        const genres = []
        const producers = []

        toPush.title = $(this).find('.main-title').text()

        toPush.jpTitle = $(this).find('.jp-title').text()

        $(this).find('.anime-tags').each(function () {
          $(this).find('li').each(function () {
            genres.push($(this).text())
          })
        })
        toPush.genres = genres

        toPush.picture = $(this).find('.anime-card-body .poster-container img').attr('data-src')

        toPush.synopsis = $(this).find('.anime-synopsis').text()

        $(this).find('.anime-studios').each(function () {
          $(this).find('li').each(function () {
            producers.push($(this).text())
          })
        })
        toPush.producers = producers

        toPush.releaseDate = $(this).find('.anime-date').text()

        toPush.nbEp = $(this).find('.anime-episodes').text().split(' ')[0]

        toPush.fromType = $(this).find('.anime-source').text()

        result.push(toPush)
      })

      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

/**
 * Allows to gather seasonal information from livechart.me.
 * @param {number|string} year - The year of the season you want to look up for.
 * @param {string} season - Can be either "winter", "spring", "summer" or "fall".
 */
const getSeasons = (year, season) => {
  return new Promise((resolve, reject) => {
    if (!possibleSeasons[season]) reject(new Error('[Mal-Scraper]: Entered seasons does not match any existing season.'))
    if (!(year <= maxYear) || !(year >= 2000)) reject(new Error(`[Mal-Scraper]: Year must be between 2000 and ${maxYear}.`))

    const uri = `${SEASON_URI}${season}-${year}/`

    const promises = [
      getType('tv', uri),
      getType('ovas', uri),
      getType('movies', uri)
    ]

    Promise.all(promises)
      .then((results) => {
        resolve({
          TV: results[0],
          OVAs: results[1],
          Movies: results[2]
        })
      })
      .catch((err) => reject(err))
  })
}

module.exports = getSeasons
