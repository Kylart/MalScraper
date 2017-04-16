/**
 * Created by Kylart on 07/12/2016.
 */

const request = require('request')
const req = require('req-fast')
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
    let result = []

    req(uri + type, (err, resp) => {
      if (err) reject(err)

      const $ = cheerio.load(resp.body)

      $('.anime-card').each(function () {
        toPush = {}

        toPush.title = $(this).find('.main-title').text()

        toPush.jpTitle = $(this).find('.jp-title').text()

        let genres = []
        $(this).find('.anime-tags').each(function () {
          $(this).find('li').each(function () {
            genres.push($(this).text())
          })
        })
        toPush.genres = genres

        toPush.picture = $(this).find('.poster-container img').attr('src')

        toPush.synopsis = $(this).find('.anime-synopsis').text()

        let producers = []
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

    if (!possibleSeasons[season])
    {
      reject(new Error('Entered seasons does not match any existing season.'))
      return
    }

    if (!(year <= maxYear) || !(year >= 2000))
    {
      reject(new Error(`year must be between 2000 and ${maxYear}`))
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
      if (counter === 3)
        resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })

    getType('ovas', uri).then((items) => {
      OVAs = items

      ++counter
      if (counter === 3)
        resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })

    getType('movies', uri).then((items) => {
      Movies = items

      ++counter
      if (counter === 3)
        resolve(check(TVs, OVAs, Movies))
    }).catch((err) => { reject(err) })
  })
}

/* END OF GETTING SEASONAL ANIMES PART */


/* GETTING ANIME RELATED NEWS PART */

const byProperty = (prop) => {
  return function (a, b) {
    if (typeof a[prop] == "number")
    {
      return (a[prop] - b[prop])
    }
    return ((a[prop] < b[prop]) ? -1 : ((a[prop] > b[prop]) ? 1 : 0))
  }
}

exports.getNewsNoDetails = (callback) => {
  let completedReq = 0
  let result = []

  // We have a maximum of 300 news, it's enough
  for (let i = 1; i < 11; ++i)
  {
    req(`${NEWS_URL_URI}${i}`, (err, response) => {
      if (err) throw err

      const html = response.body
      const $ = cheerio.load(html)

      let pageElements = $('.news-unit-right')   // 20 elements

      // Pictures for each element
      let images = []
      $('.image').each(function () {
        images.push($(this).attr('src'))
      })

      // Get links for info
      let links = []
      $('.image-link').each(function () {
        links.push($(this).attr('href'))
      })

      // Gathering news' Titles
      let titles = pageElements.find('p.title').text().split('\n      ')
      titles.shift()
      let texts = pageElements.find('div.text').text().split('\n      ')
      texts.shift()

      for (let i = 0; i < titles.length; ++i)
      {
        titles[i] = titles[i].slice(0, -5)
        texts[i] = texts[i].slice(0, -5)
      }

      for (let j = 0; j < titles.length; ++j)
      {
        let tmp = links[j].split('/')
        result.push({
          title: titles[j],
          link: links[j],
          image: images[j],
          text: texts[j],
          newsNumber: tmp[tmp.length - 1]
        })
      }
      ++completedReq
      if (completedReq === 15)
      {
        // Getting the order right
        result.sort(byProperty('newsNumber'))
        result.reverse()
        callback()
      }
    })
  }
  return result
}

/* END OF GETTING ANIME RELATED NEWS PART */


/* SEARCHING FOR ANIME */

exports.getResultsFromSearch = (keyword) => {
  let items = []

  return new Promise((resolve, reject) => {
    request.get({
      uri: SEARCH_URI,
      qs: {
        type: 'anime',
        keyword: keyword
      }
    }, (err, response, body) => {
      if (err) return reject(err)

      const json = JSON.parse(body)

      json.categories.forEach((elem) => {
        if (elem.type === 'anime')
        {
          elem.items.forEach((item) => {
            items.push(item)
          })
        }
      })

      resolve(items)
    })
  })
}

exports.getInfoFromName = (name) => {
  return new Promise((resolve, reject) => {
    mal.fromName(name).then((anime) => {
      resolve(anime)
    }).catch((err) => {
      reject(`[Mal-Scraper] An error occurred while looking for info about ${name}: ${err}`)
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