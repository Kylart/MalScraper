const axios = require('axios')
const cheerio = require('cheerio')

const SEASON_URI = 'https://myanimelist.net/anime/season/'
const maxYear = 1901 + (new Date()).getYear()
const possibleSeasons = {
  winter: 1,
  spring: 1,
  summer: 1,
  fall: 1
}

const type2Class = {
  TV: 1,
  TVNew: 1,
  TVCon: 1,
  OVAs: 2,
  Movies: 3,
  Specials: 4,
  ONAs: 5
}

const possibleTypes = Object.keys(type2Class)
const possibleTV = {
  TVNew: 'TV (New)',
  TVCon: 'TV (Continuing)'
}

function parseDate (date) {
  const year = date.substr(0, 4)
  const month = date.substr(4, 2) - 1
  const day = date.substr(6, 2)
  return new Date(year, month, day)
}

const getType = (type, $) => {
  const result = []
  const typeString = possibleTypes.find((_type) => type === _type)

  let classToSearch = `.js-seasonal-anime-list-key-${type2Class[typeString]} .seasonal-anime.js-seasonal-anime`
  const typeClass = `.js-seasonal-anime-list-key-${type2Class[typeString]}`

  // If TVNew or TVCon are selected, filter them out to the specific elements on page
  if (Object.keys(possibleTV).includes(typeString)) {
    const tvType = possibleTV[typeString]

    $(typeClass).children('.anime-header').each(function () {
      if ($(this).text() === tvType) {
        classToSearch = $(this)
          .parent()
          .children()
          .filter(function () { return $(this).hasClass('seasonal-anime') })
      }
    })
  }

  $(classToSearch).each(function () {
    // For obvious reasons (or not)
    if ($(this).hasClass('kids') || $(this).hasClass('r18')) return

    const general = $(this).find('div:nth-child(1)')
    const picture = $(this).find('.image').find('img')
    const prod = $(this).find('.prodsrc')
    const info = $(this).find('.title')
    const synopsis = $(this).find('.synopsis')
    const epsRuntime = prod.find('span:contains(\'eps\')').text().split('\n').map(i => i.trim())

    result.push({
      picture: picture.attr(picture.hasClass('lazyload') ? 'data-src' : 'src'),
      synopsis: synopsis.find('p.preline').text().trim(),
      licensor: synopsis.find('p').attr('data-licensors') ? synopsis.find('p').attr('data-licensors').slice(0, -1) : '',
      title: general.find('.title').find('h2 a').text().trim(),
      link: general.find('.title').find('a').attr('href') ? general.find('.title').find('a').attr('href').replace('/video', '') : '',
      genres: general.find('.genres').find('.genres-inner').text().trim().split('          \n').map(genre => genre.trim()),
      producers: synopsis.find('.caption:contains(\'Studio\')').next().find('a').text(),
      fromType: synopsis.find('.caption:contains(\'Source\')').next().text(),
      nbEp: epsRuntime[1],
      runtime: epsRuntime[2],
      releaseDate: parseDate(info.find('.js-start_date').text()),
      score: parseFloat(info.find('.js-score').text()),
      members: parseInt(info.find('.js-members').text())
    })
  })

  return result
}

/**
 * Allows to gather seasonal information from myanimelist.net
 * @param {number|string} year - The year of the season you want to look up for.
 * @param {string} season - Can be either "winter", "spring", "summer" or "fall".
 * @param {string} type - The type of show you can search for, can be "TV", "TVNew", "TVCon", "ONAs", "OVAs", "Specials" or "Movies".
 */
const getSeasons = (year, season, type) => {
  return new Promise((resolve, reject) => {
    if (!possibleSeasons[season]) {
      reject(new Error('[Mal-Scraper]: Entered season does not match any existing season.'))
      return
    }
    if (!(year <= maxYear) || !(year >= 1917)) {
      reject(new Error(`[Mal-Scraper]: Year must be between 1917 and ${maxYear}.`))
      return
    }

    const uri = `${SEASON_URI}${year}/${season}`

    axios.get(uri)
      .then(({ data }) => {
        const $ = cheerio.load(data)

        if (typeof type === 'undefined') {
          resolve({
            TV: getType('TV', $),
            TVNew: getType('TVNew', $),
            TVCon: getType('TVCon', $),
            OVAs: getType('OVAs', $),
            ONAs: getType('ONAs', $),
            Movies: getType('Movies', $),
            Specials: getType('Specials', $)
          })
        } else {
          if (!possibleTypes.includes(type)) {
            reject(new Error(`[Mal-Scraper]: Invalid type provided, Possible options are ${possibleTypes.join(', ')}`))
            return
          }
          resolve(getType(type, $))
        }
      })
      .catch(/* istanbul ignore next */ (err) => {
        reject(err)
      })
  })
}

module.exports = getSeasons
