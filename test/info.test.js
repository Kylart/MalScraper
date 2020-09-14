const test = require('ava')
const { getInfoFromName, getInfoFromURL, getResultsFromSearch } = require('../src')

const name = 'Sakura Trick'
const url = 'https://myanimelist.net/anime/20047/Sakura_Trick'

test.beforeEach(async t => {
  await new Promise(resolve => setTimeout(resolve, 1500))
})

test('getInfoFromURL Tests of informations', async t => {
  try {
    const data = await getInfoFromURL("https://myanimelist.net/manga/21479/Sword_Art_Online")

	console.log(data)

    t.is(typeof data, 'object')
    t.is(data.title, 'Ansatsu Kyoushitsu 2nd Season')
    t.not(data.picture, undefined)
  } catch (e) {
    t.fail()
  }
})

test('getInfoFromURL returns an error if invalid url', async t => {
  try {
    await getInfoFromURL('hello')
  } catch (e) {
    e.message.includes('Invalid Url')
      ? t.pass()
      : t.fail()
  }
})

test('getInfoFromURL returns valid information', async t => {
  try {
    const data = await getInfoFromURL(url)

    t.is(typeof data, 'object')
    t.is(data.title, name)
    t.is(data.characters.length, 10)
    t.is(data.staff.length, 4)
    t.is(data.status, 'Finished Airing')
    t.is(data.studios[0], 'Studio Deen')
    t.not(data.picture, undefined)
  } catch (e) {
    t.fail()
  }
})

test('getInfoFromURL returns valid information for an anime that has mix names', async t => {
  try {
    const data = await getInfoFromURL('https://myanimelist.net/anime/30654/Ansatsu_Kyoushitsu_2nd_Season')

    t.is(typeof data, 'object')
    t.is(data.title, 'Ansatsu Kyoushitsu 2nd Season')
    t.not(data.picture, undefined)
  } catch (e) {
    t.fail()
  }
})

test('getInfoFromName returns an error if invalid name', async t => {
  try {
    await getInfoFromName()
  } catch (e) {
    e.message.includes('Invalid name')
      ? t.pass()
      : t.fail()
  }
})

test('getInfoFromName returns valid information', async t => {
  try {
    const data = await getInfoFromName(name)

    t.is(typeof data, 'object')
    t.is(data.title, name)
    t.is(data.characters.length, 10)
    t.is(data.staff.length, 4)
    t.is(data.status, 'Finished Airing')
    t.is(data.studios[0], 'Studio Deen')
  } catch (e) {
    t.fail()
  }
})

test('getResultsFromSearch returns an error if invalid keyword', async t => {
  try {
    await getResultsFromSearch()
  } catch (e) {
    e.message.includes('[Mal-Scraper]')
      ? t.pass()
      : t.fail()
  }
})

test('getResultsFromSearch returns a valid array', async t => {
  try {
    const data = await getResultsFromSearch(name)

    t.is(typeof data, 'object')
    t.is(data.length, 10)
    t.is(data[0].name, name)
    t.is(data[0].id, 20047)
  } catch (e) {
    t.fail()
  }
})
