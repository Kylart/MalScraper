const axios = require('axios')
const cheerio = require('cheerio')
const { getResultsFromSearch } = require('./info.js')

const BASE_URI = 'https://myanimelist.net/anime/'
const NUMBER_REVIEWS_BY_PAGE = 20
const INITIAL_FIRST_PAGE_REVIEW = 1

const malDateToJsDate = (malDate) => {
  return new Date(malDate)
}

const malNumberToJsNumber = (malNumber) => {
  return malNumber ? Number(malNumber) : 0
}

const parsePage = ($) => {
  const items = $('.borderDark')
  const result = []

  items.each(function (elem) {
    const notes = $(this).find('.spaceit.pt8 div')
    const reviewMore = $(this).find('.spaceit.pt8 span')
    // For presenting the review only without the notes
    $(this).find('.spaceit.pt8 div').remove()
    $(this).find('.spaceit.pt8 span').remove()
    $(this).find('.spaceit.pt8 a.js-toggle-review-button').remove()

    result.push({
      author: $($(this).find('.spaceit td:nth-child(2) a')['0']).text().trim(),
      date: malDateToJsDate($($(this).find('.spaceit .mb8 div')['0']).text().trim()),
      seen: $(this).find('.spaceit .mb8 .lightLink').text().trim(),
      note_overall: malNumberToJsNumber($(notes).find('tr:nth-child(1) td:nth-child(2)').text().trim()),
      note_story: malNumberToJsNumber($(notes).find('tr:nth-child(2) td:nth-child(2)').text().trim()),
      note_animation: malNumberToJsNumber($(notes).find('tr:nth-child(3) td:nth-child(2)').text().trim()),
      note_sound: malNumberToJsNumber($(notes).find('tr:nth-child(4) td:nth-child(2)').text().trim()),
      note_character: malNumberToJsNumber($(notes).find('tr:nth-child(5) td:nth-child(2)').text().trim()),
      note_enjoyment: malNumberToJsNumber($(notes).find('tr:nth-child(6) td:nth-child(2)').text().trim()),
      review: $(this).find('.spaceit.pt8').text().trim() + $(reviewMore).text().trim()
    })
  })

  return result
}

const searchPage = (url, limit, skip, p, res = []) => {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: {
        p
      }
    }).then(({ data }) => {
      const $ = cheerio.load(data)

      const tmpRes = parsePage($)
      res = res.concat(tmpRes)

      if (skip !== 0) {
        res.splice(0, skip)
        skip = 0
      }

      if (res.length <= limit) {
        p++
        searchPage(url, limit, skip, p, res)
          .then((data) => resolve(data))
          .catch(/* istanbul ignore next */(err) => reject(err))
      } else {
        if (res.length !== limit) {
          const nbrElementToRemove = res.length - limit
          res.splice(-nbrElementToRemove, nbrElementToRemove)
        }
        resolve(res)
      }
    }).catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromName = (name, limit, skip, p) => {
  return new Promise((resolve, reject) => {
    getResultsFromSearch(name).then((items) => {
      const { url } = items[0]

      searchPage(`${encodeURI(url)}/reviews`, limit, skip, p)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    }).catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsFromNameAndId = (id, name, limit, skip, p) => {
  return new Promise((resolve, reject) => {
    searchPage(`${BASE_URI}${id}/${encodeURI(name)}/reviews`, limit, skip, p)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getReviewsList = (obj) => {
  return new Promise((resolve, reject) => {
    if (!obj || typeof obj !== 'object') {
      reject(new Error('[Mal-Scraper]: No id nor name received.'))
      return
    }
    const { id, name, limit } = obj
    let skip = obj.skip ? obj.skip : 0

    if ((obj.id && (!name || isNaN(+id))) || typeof name !== 'string') {
      reject(new Error('[Mal-Scraper]: Malformed input. ID or name is malformed or missing.'))
      return
    }

    let p = INITIAL_FIRST_PAGE_REVIEW
    if (skip !== 0) {
      p = Math.floor(skip / NUMBER_REVIEWS_BY_PAGE) + 1
      skip = Math.max(0, skip - ((p - 1) * NUMBER_REVIEWS_BY_PAGE))
    }

    if (obj.id) {
      getReviewsFromNameAndId(id, name, limit, skip, p)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    } else {
      getReviewsFromName(name, limit, skip, p)
        .then((data) => resolve(data))
        .catch(/* istanbul ignore next */(err) => reject(err))
    }
  })
}

module.exports = {
  getReviewsList
}
