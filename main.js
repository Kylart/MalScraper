/**
 * Created by Kylart on 07/12/2016.
 */

const axios = require('axios')
const cheerio = require('cheerio')
const mal = require('malapi').Anime

const NEWS_URL_URI = 'https://myanimelist.net/news?p='
const SEARCH_URI = 'https://myanimelist.net/search/prefix.json'

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
