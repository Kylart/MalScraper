/**
 * Created by Kylart on 07/12/2016.
 */

const axios = require('axios')
const cheerio = require('cheerio')
const mal = require('malapi').Anime

const SEARCH_URI = 'https://myanimelist.net/search/prefix.json'

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

exports.getInfoFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    mal.fromUrl(url).then((anime) => {
      resolve(anime)
    }).catch((err) => {
      reject(new Error(`[Mal-Scraper] An error occurred while looking for info about ${url}: ${err}`))
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
