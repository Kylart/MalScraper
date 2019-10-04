const axios = require('axios')
const cheerio = require('cheerio')
const match = require('match-sorter')

const SEARCH_URI = 'https://myanimelist.net/search/prefix.json'

const getFromBorder = ($, t) => {
  return $(`span:contains("${t}")`).parent().text().trim().split(' ').slice(1).join(' ').split('\n')[0].trim()
}

const getPictureUrl = (url) => {
  const sizeRegex = /\/r\/\d*x\d*/
  const parts = url.split('.')

  const completeUrl = parts.slice(0, -1).join('.').replace(sizeRegex, '') + '.jpg'

  return completeUrl
}

const parseCharacterOrStaff = (tr, isStaff = false) => {
  const getPicture = (nbChild) => {
    const src = tr.find(`td:nth-child(${nbChild})`).find('img').attr('data-srcset')

    if (src && src.includes('1x') && src.includes('2x')) {
      return getPictureUrl(src.split('1x, ')[1].replace(' 2x', ''))
    } else {
      // This most likely means that the seiyuu is not here.
      return undefined
    }
  }

  return JSON.parse(JSON.stringify({
    link: tr.find('td:nth-child(1)').find('a').attr('href'),
    picture: getPicture(1),
    name: tr.find('td:nth-child(2)').text().trim().split('\n')[0],
    role: tr.find('td:nth-child(2)').text().trim().split('\n')[2].trim(),
    seiyuu: !isStaff ? {
      link: tr.find('td:nth-child(3)').find('a').attr('href'),
      picture: getPicture(3),
      name: tr.find('td:nth-child(3)').find('a').text().trim()
    } : undefined
  }))
}

const getCharactersAndStaff = ($) => {
  const results = {
    characters: [],
    staff: []
  }

  // Characters
  const leftC = $('div.detail-characters-list').first().find('div.left-column')
  const rightC = $('div.detail-characters-list').first().find('div.left-right')

  const nbLeftC = leftC.children('table').length
  const nbRightC = rightC.children('table').length

  // Staff
  const leftS = $('div.detail-characters-list').last().find('div.left-column')
  const rightS = $('div.detail-characters-list').last().find('div.left-right')

  const nbLeftS = leftS.children('table').length
  const nbRightS = rightS.children('table').length

  // Characters
  for (let i = 1; i <= nbLeftC; ++i) {
    results.characters.push(parseCharacterOrStaff(leftC.find(`table:nth-child(${i}) > tbody > tr`)))
  }

  for (let i = 1; i <= nbRightC; ++i) {
    results.characters.push(parseCharacterOrStaff(rightC.find(`table:nth-child(${i}) > tbody > tr`)))
  }

  // Staff
  for (let i = 1; i <= nbLeftS; ++i) {
    results.staff.push(parseCharacterOrStaff(leftS.find(`table:nth-child(${i}) > tbody > tr`), true))
  }

  for (let i = 1; i <= nbRightS; ++i) {
    results.staff.push(parseCharacterOrStaff(rightS.find(`table:nth-child(${i}) > tbody > tr`), true))
  }

  return results
}

const parsePage = (data) => {
  const $ = cheerio.load(data)
  const result = {}

  result.title = $('span[itemprop="name"]').first().text()
  result.synopsis = $('.js-scrollfix-bottom-rel span[itemprop="description"]').text()
  result.picture = $('img.ac').attr('src')

  const staffAndCharacters = getCharactersAndStaff($)
  result.characters = staffAndCharacters.characters
  result.staff = staffAndCharacters.staff

  result.trailer = $('a.iframe.js-fancybox-video.video-unit.promotion').attr('href')

  // Parsing left border.
  result.englishTitle = getFromBorder($, 'English:')
  result.japaneseTitle = getFromBorder($, 'Japanese:')
  result.synonyms = getFromBorder($, 'Synonyms:')
  result.type = getFromBorder($, 'Type:')
  result.episodes = getFromBorder($, 'Episodes:')
  result.status = getFromBorder($, 'Status:')
  result.aired = getFromBorder($, 'Aired:')
  result.premiered = getFromBorder($, 'Premiered:')
  result.broadcast = getFromBorder($, 'Broadcast:')
  result.producers = getFromBorder($, 'Producers:').split(',       ')
  result.studios = getFromBorder($, 'Studios:').split(',       ')
  result.source = getFromBorder($, 'Source:')
  result.genres = getFromBorder($, 'Genres:').split(', ')
  result.duration = getFromBorder($, 'Duration:')
  result.rating = getFromBorder($, 'Rating:')
  result.score = getFromBorder($, 'Score:').split(' ')[0].slice(0, -1)
  result.scoreStats = getFromBorder($, 'Score:').split(' ').slice(1).join(' ').slice(1, -1)
  result.ranked = getFromBorder($, 'Ranked:').slice(0, -1)
  result.popularity = getFromBorder($, 'Popularity:')
  result.members = getFromBorder($, 'Members:')
  result.favorites = getFromBorder($, 'Favorites:')

  return result
}

const getInfoFromURL = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string' || !url.toLocaleLowerCase().includes('myanimelist')) {
      reject(new Error('[Mal-Scraper]: Invalid Url.'))
    }

    url = encodeURI(url)

    axios.get(url)
      .then(({ data }) => {
        const res = parsePage(data)
        res.id = +url.split(/\/+/)[3]
        resolve(res)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getResultsFromSearch = (keyword) => {
  return new Promise((resolve, reject) => {
    if (!keyword) reject(new Error('[Mal-Scraper]: Received no keyword to search.'))

    axios.get(SEARCH_URI, {
      params: {
        type: 'anime',
        keyword
      }
    }).then(({ data }) => {
      const items = []

      data.categories.forEach((elem) => {
        elem.items.forEach((item) => {
          items.push(item)
        })
      })

      resolve(items)
    }).catch(/* istanbul ignore next */(err) => {
      reject(err)
    })
  })
}

const getInfoFromName = (name, getBestMatch = true) => {
  return new Promise((resolve, reject) => {
    if (!name || typeof name !== 'string') {
      reject(new Error('[Mal-Scraper]: Invalid name.'))
    }

    getResultsFromSearch(name)
      .then(async (items) => {
        if (!items.length) {
          resolve(null)
          return
        }
        try {
          const bestMacth = getBestMatch
            ? match(items, name, { keys: ['name'] })[0]
            : items[0]
          const url = bestMacth ? bestMacth.url : items[0].url
          const data = await getInfoFromURL(url)

          data.url = url

          resolve(data)
        } catch (e) {
          /* istanbul ignore next */
          reject(e)
        }
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

module.exports = {
  getInfoFromURL,
  getResultsFromSearch,
  getInfoFromName
}
