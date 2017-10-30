const test = require('ava')
const {getInfoFromURL, getResultsFromSearch, getBestMatch} = require('../src')

const name = 'Sakura Trick'
const url = 'https://myanimelist.net/anime/20047/Sakura_Trick'

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
    t.is(data.studios, 'Studio Deen')
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

test('getBestMatch returns actual best match on getResultsFromSearch', async t => {
  try {
    const _name = 'Net-juu no Susume'
    const data = await getResultsFromSearch(_name)

    const bestMatch = getBestMatch(_name, data)
    t.is(bestMatch.id, 36038)
    t.is(bestMatch.name, _name)
  } catch (e) {
    t.fail()
  }
})
