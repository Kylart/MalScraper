/**
 * Created by Kylart on 07/12/2016.
 */

const request = require('request')
const req = require('req-fast')
const cheerio = require('cheerio')

const SEASON_URL_URI = 'https://myanimelist.net/anime/season/'
const NEWS_URL_URI = 'https://myanimelist.net/news?p='
const SEARCH_URI = 'https://myanimelist.net/search/prefix.json'

/* GETTING SEASONAL ANIMES PART */

const loadTitles = ($, animeJSON) => {
  let tmp = $('.title-text').text().split('\n        ')

  tmp.shift()     // Getting rid of an empty element at the beginning.

  tmp.forEach((elem) => {
    animeJSON.titles.push(elem.slice(0, -7))     // Loading the right name
  })
}

const loadProducer = ($, animeJSON) => {
  $('.producer').each(function () {
    animeJSON.producers.push($(this).text())
  })
}

const loadNbEpisodes = ($, animeJSON) => {
  let tmp = []

  $('.eps').each(function () {
    tmp.push($(this).text().split(' '))
  })

  // Only 16th and 17th element are interesting
  for (let i = 0; i < tmp.length; ++i)
  {
    tmp[i] = tmp[i].slice(16, 18)
  }

  tmp.forEach((elem) => {
    animeJSON.nbEps.push(elem.join(' ').slice(0, -1))
  })
}

const loadGenres = ($, animeJSON) => {
  $('.genres-inner').each(function () {
    let tmp = $(this).text().split('\n        ')
    tmp.shift()

    for (let i = 0; i < tmp.length; ++i)
    {
      tmp[i] = tmp[i].slice(0, -7)
    }

    animeJSON.genres.push(tmp)
  })
}

const loadSynopsis = ($, animeJSON) => {
  $('.synopsis').each(function () {
    animeJSON.synopsis.push($(this).text().slice(5, -8))
  })
}

const loadImages = ($, animeJSON) => {
  $('.image img').each(function () {
    animeJSON.images.push($(this).attr('data-src'))
  })
}

const loadScores = ($, animeJSON) => {
  $('.score').each(function () {
    animeJSON.scores.push($(this).text().slice(9, 13))
  })
}

const loadReleaseDates = ($, animeJSON) => {
  $('.remain-time').each(function () {
    animeJSON.releaseDates.push($(this).text().slice(19, -27))
  })
}

const loadTypes = ($, animeJSON) => {
  let stats = {
    TVNumber: 0,        // js-seasonal-anime-list-key-1
    ONANumber: 0,       // js-seasonal-anime-list-key-5
    OVANumber: 0,       // js-seasonal-anime-list-key-2
    MovieNumber: 0,     // js-seasonal-anime-list-key-3
    SpecialNumber: 0    // js-seasonal-anime-list-key-4
  }

  $('.js-seasonal-anime-list-key-1').find('div.seasonal-anime').each(function () {
    ++stats.TVNumber
    animeJSON.types.push('TV')
  })

  $('.js-seasonal-anime-list-key-5').find('div.seasonal-anime').each(function () {
    ++stats.ONANumber
    animeJSON.types.push('ONA')
  })

  $('.js-seasonal-anime-list-key-2').find('div.seasonal-anime').each(function () {
    ++stats.OVANumber
    animeJSON.types.push('OVA')
  })

  $('.js-seasonal-anime-list-key-3').find('div.seasonal-anime').each(function () {
    ++stats.MovieNumber
    animeJSON.types.push('Movie')
  })

  $('.js-seasonal-anime-list-key-4').find('div.seasonal-anime').each(function () {
    ++stats.SpecialNumber
    animeJSON.types.push('Special')
  })

  animeJSON.stats = stats
}

const loadFromType = ($, animeJSON) => {
  $('.source').each(function () {
    animeJSON.fromType.push($(this).text())
  })
}

const loadJSON = ($, animeJSON) => {
  loadTitles($, animeJSON)
  loadProducer($, animeJSON)
  loadNbEpisodes($, animeJSON)
  loadGenres($, animeJSON)
  loadSynopsis($, animeJSON)
  loadImages($, animeJSON)
  loadScores($, animeJSON)
  loadReleaseDates($, animeJSON)
  loadTypes($, animeJSON)
  loadFromType($, animeJSON)
}

exports.getSeason = (year, season, callback) => {
  const url = `${SEASON_URL_URI}${year}/${season}`

  // Make array to return
  let result = {
    info: [],
    stats: {}
  }

  let animeJSON = {
    titles: [],
    genres: [],
    images: [],
    scores: [],
    synopsis: [],
    producers: [],
    releaseDates: [],
    types: [],
    nbEps: [],
    fromType: [],
    stats: {
      TVNumber: 0,
      ONANumber: 0,
      OVANumber: 0,
      MovieNumber: 0,
      SpecialNumber: 0
    }
  }

  req(url, (err, response) => {
    if (err) throw err

    const html = response.body
    const $ = cheerio.load(html)

    loadJSON($, animeJSON)

    result.stats = animeJSON.stats

    for (let i = 0; i < animeJSON.titles.length; ++i)
    {
      result.info.push({
        title: animeJSON.titles[i],
        genres: animeJSON.genres[i],
        image: animeJSON.images[i],
        scores: animeJSON.scores[i],
        synopsis: animeJSON.synopsis[i],
        producers: animeJSON.producers[i],
        releaseDates: animeJSON.releaseDates[i],
        type: animeJSON.types[i],
        nbEp: animeJSON.nbEps[i],
        fromType: animeJSON.fromType[i]
      })
    }
    callback()
  })

  return result
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
  for (let i = 1; i < 16; ++i)
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

exports.getInfoFromURI = (item) => {
  const uri = item.url

  let result = item

  return new Promise((resolve, reject) => {
    req(uri, (err, resp) => {
      if (err) reject(err)

      const $ = cheerio.load(resp.body)

      result.synopsis = $('.js-scrollfix-bottom-rel span[itemprop="description"]').text()
      result.picture = $(`img[alt="${item.name}"]`).attr('src')

      resolve(result)
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