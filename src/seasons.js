const axios = require('axios')
const cheerio = require('cheerio')

const SEASON_URI = 'https://myanimelist.net/anime/season/'
const maxYear = 1901 + (new Date()).getYear()
const possibleSeasons = {
  'winter': 1,
  'spring': 1,
  'summer': 1,
  'fall': 1
}

const type2Class = {
  TV: 1,
  OVAs: 2,
  Movies: 3,
  Specials: 4,
  ONAs: 5
}

const getType = (type, $) => {
  const result = []
  const classToSearch = `.js-seasonal-anime-list-key-${type2Class[type]} .seasonal-anime.js-seasonal-anime`

  $(classToSearch).each(function () {
    if (!$(this).hasClass('kids') && !$(this).hasClass('r18')) {
      const general = $(this).find('div:nth-child(1)')
      const picture = $(this).find('.image').find('img')
      const prod = $(this).find('.prodsrc')
      const info = $(this).find('.information')

      result.push({
        picture: picture.attr(picture.hasClass('lazyload') ? 'data-src' : 'src'),
        synopsis: $(this).find('.synopsis').find('span').text().trim(),
        licensor: $(this).find('.synopsis').find('p').attr('data-licensors').slice(0, -1),
        title: general.find('.title').find('p').text().trim(),
        link: general.find('.title').find('a').attr('href').replace('/video', ''),
        genres: general.find('.genres').find('.genres-inner').text().trim().split('\n      \n        '),
        producers: prod.find('.producer').text().trim().split(', '),
        fromType: prod.find('.source').text().trim(),
        nbEp: prod.find('.eps').find('a').text().trim().replace(' eps', ''),
        releaseDate: info.find('.info').find('span').text().trim(),
        score: info.find('.scormem').find('.score').text().trim()
      })
    }
  })

  return result
}

/**
 * Allows to gather seasonal information from livechart.me.
 * @param {number|string} year - The year of the season you want to look up for.
 * @param {string} season - Can be either "winter", "spring", "summer" or "fall".
 */
const getSeasons = (year, season) => {
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

        resolve({
          TV: getType('TV', $),
          OVAs: getType('OVAs', $),
          ONAs: getType('ONAs', $),
          Movies: getType('Movies', $),
          Specials: getType('Specials', $)
        })
      })
      .catch(/* istanbul ignore next */ (err) => {
        reject(err)
      })
  })
}

module.exports = getSeasons
