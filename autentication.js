require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const users = require('./controllers/userController')
const response = require('./lib/utils/response.js').response
const tokenKey = process.env.KEY

const viewCredentials = (authorization) => {
  if (!authorization || typeof authorization !== 'string') return false
  const content = authorization.split(' ')
  if (content[0].toLowerCase() !== 'basic') return false
  const userData = Buffer.from(content[1], 'base64').toString().split(':')
  return { email: userData[0], password: userData[1] }
}

const generateToken = email => {
  return jwt.sign({ email: email }, tokenKey, { expiresIn: '30d' })
}

exports.signIn = (req, res) => {
  const { email, password } = viewCredentials(req.headers.authorization)
  if (!email || !password) return res.status(401).send(response(false, null, 'Invalid Credentials.'))
  users.findByEmail(email)
    .then(user => {
      if (!user) return undefined
      return [bcrypt.compare(password, user.password), user]
    })
    .then(resp => {
      if (!resp) return res.status(401).send(response(false, null, 'User not found.'))
      else if (!resp[0]) return res.status(401).send(response(false, null, 'Invalid Password.'))
      const user = resp[1]._doc
      delete user.password
      res.status(200).send(response(true, [{ tkauth: generateToken(user.email), ...user }], 'Success.'))
    })
    .catch(error => {
      res.status(500).send(response(false, error, 'Error authenticating user.'))
    })
}
