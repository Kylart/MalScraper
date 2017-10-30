const {parseString} = require('xml2js')
const {parse} = require('js2xmlparser')

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

module.exports = {
  xml2JSON,
  JSON2Xml
}
