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

const viewAuthorization = (authorization) => {
  if (!authorization || typeof authorization !== 'string') return false
  const credential = authorization.split(' ')
  if (credential[0].toLowerCase() === 'basic') return 'code validation'
  else if (credential[0].toLowerCase() === 'bearer') return credential[1]
  return false
}

exports.generateToken = (email, expiresIn = '30d') => {
  return jwt.sign({ email: email }, tokenKey, { expiresIn: expiresIn })
}

exports.signIn = (req, res) => {
  const { email, password } = viewCredentials(req.headers.authorization)
  if (!email || !password) return res.status(401).send(response(false, null, 'Invalid Credentials.'))
  users.findByEmail(email)
    .then(async user => {
      if (!user) return undefined
      const compare = await bcrypt.compare(password, user.password)
      return [compare, user]
    })
    .then(resp => {
      if (!resp) return res.status(401).send(response(false, null, 'User not found.'))
      else if (!resp[0]) return res.status(401).send(response(false, null, 'Invalid Password.'))
      const user = resp[1]._doc
      delete user.password
      res.status(200).send(response(true, [{ tkauth: this.generateToken(user.email), ...user }], 'Success.'))
    })
    .catch(error => {
      res.status(500).send(response(false, error, 'Error authenticating user.'))
    })
}

exports.signUp = (req, res, next) => {

}

exports.verifyAutentication = (req, res, next) => {
  const token = viewAuthorization(req.headers.authorization)
  if (token === 'code validation' || req.body.register) {
    next()
    return
  }
  if (!token) return res.status(401).send(response(false, null, 'Unauthorized.'))
  jwt.verify(token, tokenKey, (err, secret) => {
    if (err || !token) return res.status(401).send(response(false, null, 'Unauthorized.'))
    req.secret = secret
    next()
  })
}
