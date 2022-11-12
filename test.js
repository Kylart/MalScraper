const a = require('./src/users')
const name = 'Kame-nos' // OrackSaiyajin

a.getUser(name)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
