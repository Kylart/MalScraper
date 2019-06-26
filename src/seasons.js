const axios = require('axios')
const cheerio = require('cheerio')
const matchSorter = require('match-sorter')

const SEASON_URI = 'https://myanimelist.net/anime/season/'
const maxYear = 1901 + (new Date()).getYear()
const possibleSeasons = {
  'winter': 1,
  'spring': 1,
  'summer': 1,
  'fall': 1
}

const possibleTypes = ['TV', 'TVNew', 'TVCon', 'OVAs', 'ONAs', 'Movies', 'Specials']
const possibleTV = ['TV (New)', 'TV (Continuing)']

const type2Class = {
  TV: 1,
  TVNew: 1,
  TVCon: 1,
  OVAs: 2,
  Movies: 3,
  Specials: 4,
  ONAs: 5
}

const getType = (type, $) => {
  const result = []

  // If TV has been selected, filter New from Continuing.
  const typeString = matchSorter(possibleTypes, type)[0]

  let classToSearch = `.js-seasonal-anime-list-key-${type2Class[typeString]} .seasonal-anime.js-seasonal-anime`
  let typeClass = `.js-seasonal-anime-list-key-${type2Class[typeString]}`

  // If TVNew or TVCon are selected, filter them out to the specific elements on page
  if (typeString.substr(0, 2) === 'TV' && typeString !== 'TV') {
    let tvType = matchSorter(possibleTV, typeString)[0]
    $(typeClass).children('.anime-header').each(function () {
      if ($(this).text() === tvType) {
        classToSearch = $(this).parent().children()
      }
    })
  }

  $(classToSearch).each(function () {
    if (!$(this).hasClass('kids') && !$(this).hasClass('r18')) {
      const general = $(this).find('div:nth-child(1)')
      const picture = $(this).find('.image').find('img')
      const prod = $(this).find('.prodsrc')
      const info = $(this).find('.information')
      const synopsis = $(this).find('.synopsis')

      result.push({
        picture: picture.attr(picture.hasClass('lazyload') ? 'data-src' : 'src'),
        synopsis: synopsis.find('span').text().trim(),
        licensor: synopsis.find('p').attr('data-licensors') ? synopsis.find('p').attr('data-licensors').slice(0, -1) : '',
        title: general.find('.title').find('p').text().trim(),
        link: general.find('.title').find('a').attr('href') ? general.find('.title').find('a').attr('href').replace('/video', '') : '',
        genres: general.find('.genres').find('.genres-inner').text().trim().split('\n      \n        '),
        producers: prod.find('.producer').text().trim().split(', '),
        fromType: prod.find('.source').text().trim(),
        nbEp: prod.find('.eps').find('a').text().trim().replace(' eps', ''),
        releaseDate: info.find('.info').find('span').text().trim(),
        score: info.find('.scormem').find('.score').text().trim(),
        members: info.find('.scormem').find('.member.fl-r').text().trim().replace(/,/g, '')
      })
    }
  })

  if (typeString === 'TVCon' || typeString === 'TVNew') {
    result.splice(0, 1)
  }
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
