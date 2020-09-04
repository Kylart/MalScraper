const test = require('ava')
const { getReviewsList } = require('../src')

const NS = {
  name: 'Naruto Shippuuden',
  id: 1735
}

test.beforeEach(async t => {
  await new Promise(resolve => setTimeout(resolve, 5000))
})

test('getReviewsList returns the first review for Naruto Shippuuden with ID and name', async t => {
  try {
    const data = await getReviewsList({
      name: NS.name,
      id: NS.id,
      limit: 40
    })

    t.is(typeof data, 'object')
    t.is(data.length, 40)
    t.is(data[0].author, 'Xyik')
    t.is(data[0].note_overall, 6)
    t.is(data[0].note_story, 8)
    t.is(data[0].note_animation, 7)
    t.is(data[0].note_sound, 6)
    t.is(data[0].note_character, 8)
    t.is(data[0].note_enjoyment, 7)
    t.is(data[20].author, 'husa2004')
    t.is(data[20].note_overall, 10)
    t.is(data[20].note_story, 10)
    t.is(data[20].note_animation, 9)
    t.is(data[20].note_sound, 9)
    t.is(data[20].note_character, 9)
    t.is(data[20].note_enjoyment, 10)
  } catch (e) {
    t.fail()
  }
})

test('getReviewsList returns the second reviews after the first page for Naruto Shippuuden with ID and name', async t => {
  try {
    const data = await getReviewsList({
      name: NS.name,
      id: NS.id,
      limit: 1,
      skip: 21
    })

    t.is(typeof data, 'object')
    t.is(data.length, 1)
    t.is(data[0].author, 'Bluthut')
    t.is(data[0].note_overall, 9)
    t.is(data[0].note_story, 9)
    t.is(data[0].note_animation, 8)
    t.is(data[0].note_sound, 9)
    t.is(data[0].note_character, 9)
    t.is(data[0].note_enjoyment, 10)
  } catch (e) {
    t.fail()
  }
})

test('getReviewsList returns the 20 firsts review base on the name of the anime', async t => {
  try {
    const data = await getReviewsList({
      name: NS.name,
      limit: 40
    })

    t.is(typeof data, 'object')
    t.is(data.length, 40)
    t.is(data[0].author, 'Xyik')
    t.is(data[0].note_overall, 6)
    t.is(data[0].note_story, 8)
    t.is(data[0].note_animation, 7)
    t.is(data[0].note_sound, 6)
    t.is(data[0].note_character, 8)
    t.is(data[0].note_enjoyment, 7)
    t.is(data[20].author, 'husa2004')
    t.is(data[20].note_overall, 10)
    t.is(data[20].note_story, 10)
    t.is(data[20].note_animation, 9)
    t.is(data[20].note_sound, 9)
    t.is(data[20].note_character, 9)
    t.is(data[20].note_enjoyment, 10)
  } catch (e) {
    t.fail()
  }
})
