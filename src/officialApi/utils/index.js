const {parseString} = require('xml2js')
const {parse} = require('js2xmlparser')
const {each} = require('lodash')

const xml2JSON = (string) => {
  let json
  let error = null

  parseString(string, (err, res) => {
    !err
      ? json = res
      : error = err
  })

  return error || json
}

const JSON2Xml = (json) => {
  return parse('entry', json)
}

/**
 * Flatten the FIRST level of an object with array values.
 * @param {object} obj The object to flatten.
 */
const flatten = (obj) => {
  each(obj, (value, key) => {
    obj[key] = value[0]
  })

  return obj
}

module.exports = {
  xml2JSON,
  JSON2Xml,
  flatten
}
