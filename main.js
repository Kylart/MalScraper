/**
 * Created by Kylart on 07/12/2016.
 */

const axios = require('axios')
const cheerio = require('cheerio')
const mal = require('malapi').Anime

const SEASON_URI = 'https://www.livechart.me/' // Fu MAL :<
const NEWS_URL_URI = 'https://myanimelist.net/news?p='
const SEARCH_URI = 'https://myanimelist.net/search/prefix.json'

/* GETTING SEASONAL ANIMES PART */

const getType = (type, uri) => {
  // Type must be something like 'tv', 'ovas' or 'movies'
  return new Promise((resolve, reject) => {
    const result = []

    axios.get(uri + type).then(({data}) => {
      const $ = cheerio.load(data)

      $('.anime-card').each(function () {
        const toPush = {}

        toPush.title = $(this).find('.main-title').text()

        toPush.jpTitle = $(this).find('.jp-title').text()

        let genres = []
        $(this).find('.anime-tags').each(function () {
          $(this).find('li').each(function () {
            genres.push($(this).text())
          })
        })
        toPush.genres = genres

        toPush.picture = $(this).find('.anime-card-body .poster-container img').attr('data-src')

        toPush.synopsis = $(this).find('.anime-synopsis').text()

        const producers = []
        $(this).find('.anime-studios').each(function () {
          $(this).find('li').each(function () {
            producers.push($(this).text())
          })
        })
        toPush.producers = producers

        toPush.releaseDate = $(this).find('.anime-date').text()

        toPush.nbEp = $(this).find('.anime-episodes').text().split(' ')[0]

        toPush.fromType = $(this).find('.anime-source').text()

        result.push(toPush)
      })

      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

const check = (TV, OVAs, Movies) => {
  let stats = {
    TVNumber: TV.length,
    OVANumber: OVAs.length,
    MovieNumber: Movies.length
  }

  return {
    stats: stats,
    info: {
      TV: TV,
      OVAs: OVAs,
      Movies: Movies
    }
  }
}

exports.getSeason = (year, season) => {
  return new Promise((resolve, reject) => {
    const possibleSeasons = {
      'winter': 1,
      'spring': 1,
      'summer': 1,
      'fall': 1
    }
    const maxYear = 1901 + (new Date()).getYear()

    if (!possibleSeasons[season]) {
      reject(new Error('Entered seasons does not match any existing season.'))
      return
    }

    if (!(year <= maxYear) || !(year >= 2000)) {
      reject(new Error(`year must be between 2000 and ${maxYear}.`))
      return
    }

    const uri = `${SEASON_URI}${season}-${year}/`
    let TVs = []
    let OVAs = []
    let Movies = []

    let counter = 0

    getType('tv', uri).then((items) => {
      TVs = items

      ++counter
      if (counter === 3) resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })

    getType('ovas', uri).then((items) => {
      OVAs = items

      ++counter
      if (counter === 3) resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })

    getType('movies', uri).then((items) => {
      Movies = items

      ++counter
      if (counter === 3) resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })
  })
}

/* END OF GETTING SEASONAL ANIMES PART */

/* GETTING ANIME RELATED NEWS PART */

const byProperty = (prop) => {
  return (a, b) => {
    return typeof a[prop] === 'number'
      ? (a[prop] - b[prop])
      : (a[prop] < b[prop])
        ? -1
        : (a[prop] > b[prop])
          ? 1
          : 0
  }
}

exports.getNewsNoDetails = () => {
  let completedReq = 0
  const result = []

  return new Promise((resolve, reject) => {
    // 160 news. This is already expensive enough
    for (let i = 1; i < 9; ++i) {
      axios.get(`${NEWS_URL_URI}${i}`).then(({data}) => {
        const $ = cheerio.load(data)

        const pageElements = $('.news-unit-right')   // 20 elements

        // Pictures for each element
        const images = []
        $('.image').each(function () {
          images.push($(this).attr('src'))
        })

        // Get links for info
        const links = []
        $('.image-link').each(function () {
          links.push($(this).attr('href'))
        })

        // Gathering news' Titles
        const titles = pageElements.find('p.title').text().split('\n      ')
        titles.shift()
        const texts = pageElements.find('div.text').text().split('\n      ')
        texts.shift()

        for (let i = 0, l = titles.length; i < l; ++i) {
          titles[i] = titles[i].slice(0, -5)
          texts[i] = texts[i].slice(0, -5)
        }

        for (let i = 0, l = titles.length; i < l; ++i) {
          let tmp = links[i].split('/')
          result.push({
            title: titles[i],
            link: links[i],
            image: images[i],
            text: texts[i],
            newsNumber: tmp[tmp.length - 1]
          })
        }
        ++completedReq
        if (completedReq === 8) {
          // Getting the order right
          result.sort(byProperty('newsNumber'))
          result.reverse()
          resolve(result)
        }
      }).catch((err) => {
        reject(err)
      })
    }
  })
}

/* END OF GETTING ANIME RELATED NEWS PART */

/* SEARCHING FOR ANIME */

exports.getResultsFromSearch = (keyword) => {
  let items = []

  return new Promise((resolve, reject) => {
    axios.get(SEARCH_URI, {
      params: {
        type: 'anime',
        keyword: keyword
      }
    }).then(({data}) => {
      data.categories.forEach((elem) => {
        if (elem.type === 'anime') {
          elem.items.forEach((item) => {
            items.push(item)
          })
        }
      })

      resolve(items)
    }).catch((err) => {
      reject(err)
    })
  })
}

exports.getInfoFromName = (name) => {
  return new Promise((resolve, reject) => {
    mal.fromName(name).then((anime) => {
      resolve(anime)
    }).catch((err) => {
      reject(new Error(`[Mal-Scraper] An error occurred while looking for info about ${name}: ${err}`))
    })
  })
}

exports.getInfoFromURI = (item) => {
  const uri = item.url

  let result = item

  return new Promise((resolve, reject) => {
    axios.get(uri).then((res) => {
      const $ = cheerio.load(res.data)

      result.synopsis = $('.js-scrollfix-bottom-rel span[itemprop="description"]').text()
      result.picture = $(`img[alt="${item.name}"]`).attr('src')

      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
}

exports.getBestMatch = (name, items) => {
  let index = 0

  const toSearch = name.replace(' ', '').toLowerCase()

  items.forEach((item, i) => {
    const looking = item.name.replace(' ', '').toLowerCase()
    if (looking === toSearch) index = i
  })

  return items[index]
}
