const a = require('./src/users')
const name = 'OrackSaiyajin'

a.getUser(name)
  .then((data) => console.log(data))
  .catch((err) => console.log(err))
