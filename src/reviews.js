const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URI = 'https://myanimelist.net/anime/'

const parsePage = ($) => {
  const allItems = $('.borderDark')
  const result = []

  // Because MAL shows twice the number of elements for the order
  const items = allItems.slice(0, allItems.length / 2)

  items.each(function (elem) {
    result.push({
      author: +$(this).find('.spaceit div table tr td:nth-child(2) a').text().trim(),
      text: $(this).find('.spaceit.pt8').text().trim()
    })
  })

  return result
}

const searchPage = (url, offset = 0, res = []) => {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: {
        offset
      }
    })
      .then(({ data }) => {
        const $ = cheerio.load(data)

        const tmpRes = parsePage($)
        res = res.concat(tmpRes)
        resolve(res)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromName = (name) => {
  return new Promise((resolve, reject) => {
    getResultsFromSearch(name)
      .then((items) => {
        const { url } = items[0]

        searchPage(`${encodeURI(url)}/reviews`)
          .then((data) => resolve(data))
          .catch(/* istanbul ignore next */(err) => reject(err))
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromNameAndId = (id, name) => {
  return new Promise((resolve, reject) => {
    searchPage(`${BASE_URI}${id}/${encodeURI(name)}/reviews`)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsList = (obj) => {
  return new Promise((resolve, reject) => {
    if (!obj) {
      reject(new Error('[Mal-Scraper]: No id nor name received.'))
      return
    }

    if (typeof obj === 'object' && !obj[0]) {
      const { id, name } = obj

      if (!id || !name || isNaN(+id) || typeof name !== 'string') {
        reject(new Error('[Mal-Scraper]: Malformed input. ID or name is malformed or missing.'))
        return
      }

      getReviewsFromNameAndId(id, name)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    } else {
      getReviewsFromName(obj)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    }
  })
}

module.exports = {
  getReviewsList
}
