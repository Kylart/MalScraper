const axios = require('axios')
const cheerio = require('cheerio')

const trace = '####'
const BASE_URL = `https://myanimelist.net/${trace}.php`

const lists = require('./getLists.js')

const availableValues = {
  type: [{ name: 'none', value: 0 }, { name: 'tv', value: 1 }, { name: 'ova', value: 2 }, { name: 'movie', value: 3 }, { name: 'special', value: 4 }, { name: 'ona', value: 5 }, { name: 'music', value: 6 }],
  status: [{ name: 'none', value: 0 }, { name: 'finished', value: 1 }, { name: 'currently', value: 2 }, { name: 'not-aired', value: 3 }],
  r: [{ name: 'none', value: 0 }, { name: 'G', value: 1 }, { name: 'PG', value: 2 }, { name: 'PG-13', value: 3 }, { name: 'R', value: 4 }, { name: 'R+', value: 5 }, { name: 'Rx', value: 6 }],
  score: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  p: lists.producers,
  genre: lists.genres
}

const orderMap = {
  keys: {
    startDate: 2,
    score: 3,
    eps: 4,
    endDate: 5,
    type: 6,
    members: 7,
    rated: 8
  },
  order: {
    'DESC': 2,
    'ASC': 1
  }
}

const columns = ['thumbnail', 'title', 'type', 'nbEps', 'score', 'startDate', 'endDate', 'members', 'rating']

const getOrderParams = (opts) => {
  const { keys, order = [ 'DESC', 'DESC' ] } = opts

  if (!Array.isArray(keys) || !Array.isArray(order)) throw new Error('Invalid order parameters.')
  if (!keys.length) throw new Error('Imvalid order keys.')
  if (order && order.length !== keys.length) throw new Error('Imvalid order.')

  return keys.reduce((acc, key, index) => {
    const _order = order[index]

    acc += `o=${encodeURIComponent(orderMap.keys[key])}&w=${encodeURIComponent(orderMap.order[_order])}&`

    return acc
  }, '?')
}

const getParams = (_type, opts) => {
  const { term = '', type = 0, status = 0, score = 0, producer = 0, rating = 0, startDate = {}, endDate = {}, genreType = 0, genres = [], has: after } = opts

  if (!availableValues.type.map(({ value }) => +value).includes(type)) throw new Error('Invalid Type.')
  if (!availableValues.status.map(({ value }) => +value).includes(status)) throw new Error('Invalid status.')
  if (_type === 'anime' && !availableValues.r.map(({ value }) => +value).includes(rating)) throw new Error('Invalid rating.')

  if (!availableValues.score.includes(score)) throw new Error('Invalid score.')

  if (!availableValues.p[_type].map(({ value }) => +value).includes(producer)) throw new Error('Invalid producer.')

  genres.forEach((genre) => {
    if (genre && !availableValues.genre[_type].map(({ value }) => +value).includes(genre)) throw new Error('Invalid genre.')
  })

  return JSON.parse(JSON.stringify({
    sd: startDate.day || 0,
    sm: startDate.month || 0,
    sy: startDate.year || 0,
    ed: endDate.day || 0,
    em: endDate.month || 0,
    ey: endDate.year || 0,

    c: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],

    gx: genreType === 'exclude' ? 1 : 0,

    q: term,
    p: producer,
    r: _type === 'anime' ? rating : undefined,

    genre: genres,
    type,
    status,
    score,

    show: typeof after === 'number' ? after : undefined
  }))
}

const parsePage = ($) => {
  const result = []
  const table = $('#content div.list table tbody tr')

  table.each(function (index) {
    if (index === 0) return

    const entry = {}

    $(this).find('td').each(function (subIndex) {
      if (subIndex === 0) {
        entry.thumbnail = $(this).find('.picSurround > a > img').attr('data-srcset').split(', ')[1].split(' ')[0]
        return
      }

      if (subIndex === 1) {
        $(this).find('a').each(function (_i) {
          if (_i > 1) return

          if (_i === 0) entry.url = $(this).attr('href')
          if (_i === 1) entry.video = $(this).text().trim() !== 'add' ? $(this).attr('href') : null
        })

        entry.shortDescription = $(this).children().last().text()

        entry.title = $(this).find('a strong').text().trim()

        return
      }

      entry[columns[subIndex]] = $(this).text().trim()
    })

    result.push(entry)
  })

  return result
}

const hasNext = ($) => {
  const anchor = $('#content > div.normal_header > div').find('a')
  const hasNext = anchor.last().text().trim().toLowerCase().includes('next')

  return {
    hasNext,
    nextUrl: hasNext ? anchor.last().attr('href') : null
  }
}

const getResults = (url, params = {}, maxResult = 50, result = []) => {
  return new Promise((resolve, reject) => {
    axios.get(url, { params })
      .then((res) => {
        const { data } = res
        const $ = cheerio.load(data)
        const next = hasNext($)
        const _result = [...result, ...parsePage($)]

        resolve(
          _result.length < maxResult && next.hasNext
            ? getResults(next.nextUrl, {}, maxResult, _result)
            : _result
        )
      })
      .catch(reject)
  })
}

const search = (type, opts) => {
  return new Promise((resolve, reject) => {
    const params = getParams(type, opts)
    const order = opts.order && getOrderParams(opts.order)

    getResults(BASE_URL.replace(trace, type) + (order || ''), params, opts.maxResult)
      .then(resolve)
      .catch(reject)
  })
}

module.exports = {
  search,
  helpers: {
    producersList: lists.producers,
    genresList: lists.genres,
    orderTypes: Object.keys(orderMap.keys)
  }
}
