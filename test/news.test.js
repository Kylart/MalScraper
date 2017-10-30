const test = require('ava')
const {getNewsNoDetails} = require('../src')

test('getNewsNoDetails returns 160 news entries', async t => {
  try {
    const data = await getNewsNoDetails()

    t.is(data.length, 160)
  } catch (e) {
    console.log(e.message)
    t.fail()
  }
})
