/**
 * Created by Kylart on 25/03/2017.
 *
 * Chai doc : http://chaijs.com/api/bdd/
 *
 */

const assert = require('assert')
const expect = require('chai').expect
const path = require('path')
const main = require(path.join(__dirname, '..', 'main.js'))

const name = 'Youjo Senki'
const id = 32615
const type = 'anime'

describe('Looking for', () => {
  describe('Sakura trick results', () => {
    it('should return 10 or more.', () => {
      return main.getResultsFromSearch('Sakura Trick').then((items) => {
        expect(items).to.have.length.above(9);
      })
    })
  })
  describe('Best result for Youjo Senki', () => {
    it('should have the exact information', function () {
      this.timeout(3000);

      return main.getResultsFromSearch(name).then((items) => {
        return main.getInfoFromURI(main.getBestMatch(name, items))
      }).then((item) => {
        expect(item.id).to.equal(id)
        expect(item.type).to.equal(type)
      })
    })
  })
})

describe('Getting news', () => {
  it('should give 200 results', () => {
    let news = main.getNewsNoDetails(() => {
      assert.equal(news.length, 200)
    })
  })
})
