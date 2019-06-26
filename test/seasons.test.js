const test = require('ava')
const { getSeason } = require('../src')

test.beforeEach(async t => {
  await new Promise(resolve => setTimeout(resolve, 1500))
})

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
    await getSeason((new Date()).getFullYear() + 3, 'fall')

    t.fail()
  } catch (e) {
    e.message.includes('Year must')
      ? t.pass()
      : t.fail()
  }
})

test('getSeasons with type TV returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'TV')

    t.is(data.length, 97)
    t.is(data[0].title, 'Mahoutsukai no Yome')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type TVNew returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'TVNew')

    t.is(data.length, 58)
    t.is(data[0].title, 'Mahoutsukai no Yome')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type TVCon returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'TVCon')

    t.is(data.length, 41)
    t.is(data[0].title, 'One Piece')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type ONAs returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'ONAs')

    t.is(data.length, 56)
    t.is(data[0].title, 'Hitori no Shita: The Outcast 2nd Season')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type OVAs returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'OVAs')

    t.is(data.length, 11)
    t.is(data[0].title, 'Shingeki no Kyojin: Lost Girls')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'Specials')

    t.is(data.length, 25)
    t.is(data[0].title, 'Net-juu no Susume Special')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons with type Movies returns the correct season', async t => {
  try {
    const data = await getSeason(2017, 'fall', 'Movies')

    t.is(data.length, 20)
    t.is(data[0].title, 'Fate/stay night Movie: Heaven\'s Feel - I. Presage Flower')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})

test('getSeasons returns the right season', async t => {
  try {
    const data = await getSeason(2017, 'fall')

    t.is(typeof data.TV, 'object')
    t.is(typeof data.TVNew, 'object')
    t.is(typeof data.TVCon, 'object')
    t.is(typeof data.OVAs, 'object')
    t.is(typeof data.Movies, 'object')
    t.is(data.TV.length, 97)
    t.is(data.TVNew.length, 58)
    t.is(data.TVCon.length, 41)
    t.is(data.OVAs.length, 11)
    t.is(data.Movies.length, 20)
    t.is(data.TV[0].title, 'Mahoutsukai no Yome')
    t.is(data.TVNew[0].title, 'Mahoutsukai no Yome')
    t.is(data.TVCon[0].title, 'One Piece')
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})
