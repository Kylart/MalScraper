const axios = require('axios')
const cheerio = require('cheerio')
const match = require('match-sorter').default

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

  // We have to do this because MAL sometimes set the english title just below the japanese one
  // Example:
  //    - with: https://myanimelist.net/anime/30654/Ansatsu_Kyoushitsu_2nd_Season
  //    - without: https://myanimelist.net/anime/20047/Sakura_Trick
  $('span[itemprop="name"] br').remove()
  $('span[itemprop="name"] span').remove()

  result.title = $('span[itemprop="name"]').first().text()
  result.synopsis = $('.js-scrollfix-bottom-rel span[itemprop="description"]').text()
  result.picture = $(`img[itemprop="image"][alt="${result.title}"]`).attr('data-src')

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
  result.genres = getFromBorder($, 'Genres:').split(', ').map((elem) => elem.trim().slice(0, elem.trim().length / 2))
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

const parseReviews = (data) => {
  const $ = cheerio.load(data)
  var reviews = []

  $('.borderDark').each(function( index ) {
    const review = {}
    review.user = $(this).find('td > a').text().trim()
    review.date = $(this).find('.mb8 div:nth-child(1)').text().trim()
    review.read = $(this).find('.mb8 .spaceit').text().trim().replace("read", "")
    var r = $(this).find('.borderClass').text().trim().split(" ").map(x => x.trim()).filter(x => x).map(x => isNaN(x) ? x : Number(x))
    var rating = {}
    rating[r[0]] = r[1]; rating[r[2]] = r[3]; rating[r[4]] = r[5]; rating[r[6]] = r[7]; rating[r[8]] = r[9];
    review.rating = rating
    review.helpful_for = Number($(this).find('.spaceit td .spaceit').text().trim().split(" ")[0])
    review.text = $(this).find('.pt8').text().split("\n        \n      \n    \n\n                          \n    ")[1].split("Helpful\n  \n      \n      read more")[0].trim().replace("\n\n          \n        ", " ")
    reviews.push(review)
  })

  return reviews
}

const parseRecommendations = (data) => {
  const $ = cheerio.load(data)
  var recs = []
  var manga = {}

  $('.js-scrollfix-bottom-rel .borderClass').each(function( index ) {
    rec = {}
    if ($(this).find('div:nth-child(2) strong').length) {
      if (index > 0) {
        recs.push(manga)
      }
      manga = {}
      manga.name = $(this).find('div:nth-child(2) strong').text().trim()
      manga.link = $(this).find('a').attr('href')
      manga.recs = []
    }
    else {
      rec.text = $(this).find('.detail-user-recs-text').text().trim().replace("read more","")
      rec.user = $(this).find('.spaceit_pad a').text().trim().replace("report","").replace("read more","")
      manga.recs.push(rec)     
    }
  })
  recs.push(manga)
  return recs
}

const parseCharacters = (data) => {
  const getPicture = (tr) => {
    const src = tr.find('img').attr('data-srcset')

    if (src && src.includes('1x') && src.includes('2x')) {
      return getPictureUrl(src.split('1x, ')[1].replace(' 2x', ''))
    } else {
      return undefined
    }
  }

  const $ = cheerio.load(data)
  var characters = []
  var char = {}

  $('.js-scrollfix-bottom-rel .borderClass').each(function( index ) {
    if (index % 2 == 0) {
      char = {}
      char.picture = getPicture($(this))
    }
    else {
      char.name = $(this).find('a').text().trim()
      char.link = $(this).find('a').attr('href')
      char.role = $(this).find('small').text().trim()
      characters.push(char)
    }
  })
  return characters
}

const getInfoFromURL = (url) => {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string' || !url.toLocaleLowerCase().includes('myanimelist')) {
      reject(new Error('[Mal-Scraper]: Invalid Url.'))
      return
    }

    url = encodeURI(url)

    var res = {}

    axios.get(url)
      .then(({ data }) => {
        res = parsePage(data)
        res.id = +url.split(/\/+/)[3]

        res.reviews = []
        const reviewLoop = page =>
          axios.get(url + '/reviews?p=' + page.toString())
          .then(({ data }) => {
            reviews = parseReviews(data)
            if (Object.keys(reviews).length > 0) {
              res.reviews = res.reviews.concat(reviews)
              return reviewLoop(page + 1)
            }
          })
          .catch(/* istanbul ignore next */(err) => reject(err))

        return reviewLoop(1)
      })
      .then(() => {
        return axios.get(url + '/userrecs')
      })
      .then(({ data }) => {
        res.recommendations = parseRecommendations(data)
        return axios.get(url + '/characters')
      })
      .then(({ data }) => {
        res.full_character_list = parseCharacters(data)
        resolve(res)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getResultsFromSearch = (keyword, type) => {
  return new Promise((resolve, reject) => {
    if (!keyword) {
      reject(new Error('[Mal-Scraper]: Received no keyword to search.'))
      return
    }

    axios.get(SEARCH_URI, {
      params: {
        type: type,
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

const getInfoFromName = (name, getBestMatch = true, type='anime') => {
  return new Promise((resolve, reject) => {
    if (!name || typeof name !== 'string') {
      reject(new Error('[Mal-Scraper]: Invalid name.'))
      return
    }

    getResultsFromSearch(name, type)
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
