const bcrypt = require('bcryptjs')
const users = require('./controllers/userController')
const response = require('./lib/utils/response').response

exports.signIn = (req, res) => {
  const { email, password } = req.body

  users.findByEmail(email)
    .then(user => {
      return bcrypt.compare(password, user.password)
    })
    .then(samePassword => {
      if (!samePassword) return res.status(401).send(response(false, null, 'Invalid Password.'))
      res.status(200).send(response(true, [], 'Success.'))
    })
    .catch(error => {
      res.status(500).send(response(false, error, 'Error authenticating user.'))
    })
}
