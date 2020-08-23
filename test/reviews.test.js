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

	console.log(data);

	t.is(typeof data, 'object')
    t.is(data[0].author, 'Xyik')
    t.is(data[0].note_overall, 6)
    t.is(data[0].note_story, 8)
    t.is(data[0].note_animation, 7)
    t.is(data[0].note_sound, 6)
    t.is(data[0].note_character, 8)
    t.is(data[0].note_enjoyment, 7)
  } catch (e) {
      console.log(e);
    t.fail()
  }
})
