const axios = require('axios');

const getReviews = (offset = 0, res = []) => {
  return new Promise((resolve, reject) => {
    axios.get("https://myanimelist.net/anime/1735/Naruto__Shippuuden/reviews")
    .then(({ data }) => {
        console.log(data)
      })
      .catch(/* istanbul ignore next */(err) => reject(err))
  })
}

module.exports = {
  getReviews
}
