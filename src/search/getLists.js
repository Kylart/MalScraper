const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')

const trace = '####'
const BASE_URL = `https://myanimelist.net/${trace}.php`

const getProducers = (type) => {
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL.replace(trace, type))
      .then(({ data }) => {
        const $ = cheerio.load(data)
        const result = []

        $(`select[name="${type === 'anime' ? 'p' : 'mid'}"] option`).each(function () {
          result.push({ value: $(this).val(), name: $(this).text().trim() })
        })

        resolve(result)
      })
      .catch((err) => reject(err))
  })
}

const getGenres = (type) => {
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL.replace(trace, type))
      .then(({ data }) => {
        const $ = cheerio.load(data)
        const result = []

        $('#advancedSearch > .space_table > tbody > tr').each(function () {
          $(this).find('td').each(function () {
            const value = $(this).find('input').val()
            const name = $(this).find('label').text().trim()

            result.push({ value, name })
          })
        })

        resolve(result)
      })
      .catch((err) => reject(err))
  })
}

module.exports = {
  getProducers,
  getGenres,
  producers: {
    anime: require(path.join(__dirname, 'anime', 'producersList.json')),
    manga: require(path.join(__dirname, 'manga', 'producersList.json'))
  },
  genres: {
    anime: require(path.join(__dirname, 'anime', 'genresList.json')),
    manga: require(path.join(__dirname, 'manga', 'genresList.json'))
  }
}
