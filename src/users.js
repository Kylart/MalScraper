const axios = require('axios')
const cheerio = require('cheerio')

const BASE_URI = 'https://myanimelist.net/profile/'

const parsePage = ($, name) => {
  const pfp = $('#content .user-image img')
  // eslint-disable-next-line no-unused-vars
  let status1 = $('.user-profile .user-status-title')
  status1 = status1.slice(0, 4)
  let status2 = $('.user-profile .user-status-data')
  status2 = status2.slice(0, 4)
  const result = []
  result.push({ username: name })
  pfp.each(function () {
    result.push({
      ProfilePictureLink: $(this).attr('data-src').trim()
    })
  })
  status2.each(function () {
    result.push({
      Status: $(this).text()
    })
  })
  return result
}

const searchPage = (url, name) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => {
        const $ = cheerio.load(data)
        const res = parsePage($, name)
        resolve(res)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getUserFromName = (name) => {
  return new Promise((resolve, reject) => {
    searchPage(`${BASE_URI}${name}`, name)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getUser = (name) => {
  return new Promise((resolve, reject) => {
    if (!name || typeof name !== 'string') {
      reject(new Error('[Mal-Scraper]: Malformed input. ID or name is malformed or missing.'))
      return
    }

    getUserFromName(name)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

module.exports = {
  getUser
}
