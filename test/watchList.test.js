const test = require('ava')
const {getWatchListFromUser} = require('../src')

test('getWachListFromUser returns an error if no user given', async t => {
  try {
    await getWatchListFromUser()

    t.fail()
  } catch (e) {
    e.message.includes('[Mal-Scraper]')
      ? t.pass()
      : t.fail()
  }
})

test('getWatchListFromUser returns a valid array with enttries', async t => {
  try {
    const data = await getWatchListFromUser('Kylart')

    t.is(typeof data, 'object')
    t.not(data.length, 0)
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})
