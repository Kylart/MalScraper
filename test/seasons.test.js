const test = require('ava')
const {getSeason} = require('../src')

test('getSeasons returns an error if not valid season', async t => {
  try {
    await getSeason(2017, 'bla')

    t.fail()
  } catch (e) {
    e.message.includes('existing season')
      ? t.pass()
      : t.fail()
  }
})

test('getSeasons returns an error if not valid year', async t => {
  try {
    await getSeason(2020, 'fall')

    t.fail()
  } catch (e) {
    e.message.includes('Year must')
      ? t.pass()
      : t.fail()
  }
})

test('getSeasons returns the right season', async t => {
  try {
    const data = await getSeason(2017, 'fall')

    t.is(typeof data.TV, 'object')
    t.is(typeof data.OVAs, 'object')
    t.is(typeof data.Movies, 'object')
    t.is(data.TV.length, 108)
    t.is(data.OVAs.length, 8)
    t.is(data.Movies.length, 15)
    t.is(data.TV[0].title, 'Mahoutsukai no Yome')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})
