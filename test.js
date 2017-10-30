const Api = require('./src/officialApi')

const api = new Api({username: 'Kylart', password: 'Ayuu<31609'})

api.search('anime', 'Mahoutsukai no Yome')
  .then((data) => {
    const id = data[1].id[0]

    api.actOnList({support: 'anime', action: 'delete'}, id)
      .then((data) => console.log(data))
      .catch((err) => console.log(err))
  })
  .catch((err) => console.log(err.message))
