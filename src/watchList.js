const axios = require('axios')
const cheerio = require('cheerio')

const toCamelCase = (string) => {
  return string
    .split('_')
    .map((chunk, index) => index ? chunk.charAt(0).toUpperCase() + chunk.slice(1) : chunk)
    .join('')
}

const flatten = (obj) => {
  return Object.keys(obj)
    .reduce((acc, key) => {
      acc[toCamelCase(key)] = obj[key]

      return acc
    }, {})
}

const parseStats = (stats) => {
  return stats.split('\n')
    .reduce((acc, stat) => {
      const _stat = stat.replace(/(\s|,)/g, '')
      const parts = _stat.split(_stat.includes('.:') ? '.:' : ':')

      const key = parts[0]
      const value = parts[1]

      acc[key] = +value

      return acc
    }, {})
}

/**
 * Allows to retrieve a user's watch lists and stuff.
 * @param {string} user The name of the user.
 * @param {string} type Can be either 'anime' or 'manga'
 *
 * @returns {promise}
 */

const getWatchListFromUser = (user, type = 'anime') => {
  return new Promise((resolve, reject) => {
    if (!user) {
      reject(new Error('[Mal-Scraper]: No user received.'))
      return
    }

    axios.get(`https://myanimelist.net/${type}list/${user}`)
      .then(({ data }) => {
        const $ = cheerio.load(data)
        const table = $('div.list-block table')

        if (!table) throw new Error('User does not seem to exist.')

        const jsonData = JSON.parse(table.attr('data-items'))
        const stats = $('div.list-block div.list-stats').text().trim()

        resolve({
          stats: parseStats(stats),
          lists: jsonData.map(flatten)
        })
      })
      .catch((err) => reject(err))
  })
}

module.exports = {
  getWatchListFromUser
}
