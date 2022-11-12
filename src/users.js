const axios = require('axios')
const cheerio = require('cheerio')

const BASE_URI = 'https://myanimelist.net/profile/'

const parsePage = ($, name) => {
  const pfp = $('#content .user-image img')
  const status1 = $('#content .user-profile .user-status-title')
  const status2 = $('#content .user-profile .user-status-data')
  const result = []
  result.push({ Username: name })
  pfp.each(function () {
    result.push({
      ProfilePictureLink: $(this).attr('data-src').trim()
    })
  })
  result.push({
    LastOnline: $(status2[0]).text()
  })
  let i = 1
  const arrayLength = status1.length
  while (i < arrayLength - 1) {
    const val = $(status1[i]).text()
    switch (val) {
      case 'Gender':
        result.push({
          Gender: $(status2[i]).text()
        })
        break
      case 'Birthday':
        result.push({
          Birthday: $(status2[i]).text()
        })
        break
      case 'Location':
        result.push({
          Location: $(status2[i]).text()
        })
        break
      case 'Joined':
        result.push({
          Joined: $(status2[i]).text()
        })
    }
    i++
  }
  const bio = $('#content .profile-about-user .word-break')
  if ($(bio).text() !== '') {
    result.push({
      Bio: $(bio).text().replace(/\n\n/g, '').trim().replace(/\n/g, ' ').trim()
    })
  }
  const stats = $('#statistics .stat-score').text().replace(/\n\n/g, '').trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  const words = stats.split(' ')
  result.push({
    AnimeDays: words[1]
  })
  result.push({
    AnimeMeanScore: words[4]
  })
  result.push({
    MangaDays: words[6]
  })
  result.push({
    MangaMeanScore: words[9]
  })
  const fav = $('#anime_favorites .fs10')
  if ($(fav).text() !== '') {
    const favAnime = []
    fav.each(function () {
      favAnime.push($(this).text())
    })
    result.push({
      FavoriteAnime: favAnime
    })
  }
  const fav2 = $('#manga_favorites .fs10')
  if ($(fav2).text() !== '') {
    const favManga = []
    fav2.each(function () {
      favManga.push($(this).text())
    })
    result.push({
      FavoriteManga: favManga
    })
  }
  const fav3 = $('#character_favorites .fs10')
  if ($(fav3).text() !== '') {
    const favChar = []
    fav3.each(function () {
      favChar.push($(this).text())
    })
    result.push({
      FavoriteCharacters: favChar
    })
  }
  const fav4 = $('.favmore .fs10')
  if ($(fav4).text() !== '') {
    const favPeople = []
    fav4.each(function () {
      favPeople.push($(this).text())
    })
    result.push({
      FavoritePeople: favPeople
    })
  }
  // putting all the properties and values to one object
  const finalObj = {}
  for (let i = 0; i < result.length; i++) {
    Object.assign(finalObj, result[i])
  }
  return finalObj
}

const searchPage = (url, name) => {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => {
        const $ = cheerio.load(data)
        const res = parsePage($, name)
        resolve(res)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getUserFromName = (name) => {
  return new Promise((resolve, reject) => {
    searchPage(`${BASE_URI}${name}`, name)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

const getUser = (name) => {
  return new Promise((resolve, reject) => {
    if (!name || typeof name !== 'string') {
      reject(new Error('[Mal-Scraper]: Malformed input. Name is malformed or missing.'))
      return
    }

    getUserFromName(name)
      .then((data) => resolve(data))
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

module.exports = {
  getUser
}
