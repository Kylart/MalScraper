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
      id: NS.id
    })

    console.log(data);
    t.is(typeof data, 'object')
  } catch (e) {
      console.log(e);
    t.fail()
  }
})
