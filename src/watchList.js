const axios = require('axios')
const cheerio = require('cheerio')

const getWatchListFromUser = (user) => {
  return new Promise((resolve, reject) => {
    if (!user) reject(new Error('[Mal-Scraper]: No user received.'))
    axios.get('https://myanimelist.net/animelist/' + user)
      .then(({data}) => {
        const $ = cheerio.load(data)

        resolve(JSON.parse($('table.list-table').attr('data-items')))
      })
      .catch((err) => reject(err))
  })
}

module.exports = {
  getWatchListFromUser
}
