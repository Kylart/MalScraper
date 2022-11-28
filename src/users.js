const axios = require('axios')
const cheerio = require('cheerio')

const BASE_URI = 'https://myanimelist.net/profile/'

/* the method that it's used in order to use to parse the page
   and get all the info we want
 */
const parsePage = ($, name) => {
  const pfp = $('#content .user-image img') // getting the profile picture page section
  const status1 = $('#content .user-profile .user-status-title') // getting the status titles page section
  const status2 = $('#content .user-profile .user-status-data') // getting the status data page section
  const result = {} // we will put here all the properties
  // pushing some basic properties and values
  Object.assign(result, { Username: name })
  Object.assign(result, { ProfilePictureLink: $(pfp).attr('data-src').trim() })
  Object.assign(result, { LastOnline: $(status2[0]).text() })

  // loop for the status
  let i = 1
  const arrayLength = status1.length
  while (i < arrayLength - 1) {
    const val = $(status1[i]).text()
    switch (val) {
      case 'Gender':
        Object.assign(result, { Gender: $(status2[i]).text() })
        break
      case 'Birthday':
        Object.assign(result, { Birthday: $(status2[i]).text() })
        break
      case 'Location':
        Object.assign(result, { Location: $(status2[i]).text() })
        break
      case 'Joined':
        Object.assign(result, { Joined: $(status2[i]).text() })
    }
    i++
  }
  const bio = $('#content .profile-about-user .word-break') // getting the bio page section
  if ($(bio).text() !== '') { // check if there is no bio
    Object.assign(result, { Bio: $(bio).text().replace(/\n\n/g, '').trim().replace(/\n/g, ' ').trim() }) // trim the whitespaces and remove extra newlines
  }
  // getting the text of the stats page section
  const stats = $('#statistics .stat-score').text().replace(/\n\n/g, '').trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  // getting the words of the text
  const words = stats.split(' ')
  // pushing the right values
  Object.assign(result, { AnimeDays: words[1] })
  Object.assign(result, { AnimeMeanScore: words[4] })
  Object.assign(result, { MangaDays: words[6] })
  Object.assign(result, { MangaMeanScore: words[9] })
  /*
    getting and pushing the user's favorites
    anime, manga, characters and people
  */
  const favAnimes = $('#anime_favorites .fs10')
  if ($(favAnimes).text() !== '') { // check if there are no favorites
    const favAnime = []
    favAnimes.each(function () {
      favAnime.push($(this).text())
    })
    Object.assign(result, { FavoriteAnime: favAnime })
  }
  const favMangas = $('#manga_favorites .fs10')
  if ($(favMangas).text() !== '') { // check if there are no favorites
    const favManga = []
    favMangas.each(function () {
      favManga.push($(this).text())
    })
    Object.assign(result, { FavoriteManga: favManga })
  }
  const favChars = $('#character_favorites .fs10')
  if ($(favChars).text() !== '') { // check if there are no favorites
    const favChar = []
    favChars.each(function () {
      favChar.push($(this).text())
    })
    Object.assign(result, { FavoriteCharacters: favChar })
  }
  const favActors = $('.favmore .fs10')
  if ($(favActors).text() !== '') { // check if there are no favorites
    const favPeople = []
    favActors.each(function () {
      favPeople.push($(this).text())
    })
    Object.assign(result, { FavoritePeople: favPeople })
  }
  return result
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

// wrapper method to check if @name is actually string
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
