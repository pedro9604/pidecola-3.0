require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const users = require('./controllers/userController')
const response = require('./lib/utils/response.js').response
const logger = require('./lib/logger.js')
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
  if (!email || !password) return res.status(401).send(response(false, null, 'Credenciales Invalidas.'))
  users.findByEmail(email, null)
    .then(async user => {
      if (!user) return undefined
      const compare = await bcrypt.compare(password, user.password)
      return [compare, user]
    })
    .then(resp => {
      if (!resp) {
        logger.log('error', 'Usuario no encontrado.', {user: email, operation: 'signIn', status: 401})
        return res.status(401).send(response(false, null, 'Usuario no encontrado.'))
      }  
      else if (!resp[0]) {
        logger.log('error', 'Contraseña Incorrecta', {user: email, operation: 'signIn', status: 401})
        return res.status(401).send(response(false, null, 'Contraseña Incorrecta.'))
      }
      const user = resp[1]._doc
      if (!user.isVerify) {
        logger.log('error', 'Usuario no verificado', {user: email, operation: 'signIn', status: 401})
        return res.status(401).send(response(false, null, 'Usuario no verificado.'))
      }
      delete user.password
      logger.log('info', 'Inicio de sesion exitoso', {user: email, operation: 'signIn', status: 200})      
      res.status(200).send(response(true, [{ tkauth: this.generateToken(user.email), ...user }], 'Success.'))
    })
    .catch(error => {
      logger.log('error', 'Error de autenticacion', {user: email, operation: 'signIn', status: 500})
      res.status(500).send(response(false, error, 'Error authenticating user.'))
    })
}

exports.verifyAutentication = (req, res, next) => {
  const token = viewAuthorization(req.headers.authorization)
  if (token === 'code validation' || req.path === '/users') {
    return next()
  }
  if (!token) return res.status(401).send(response(false, null, 'Unauthorized.'))
  jwt.verify(token, tokenKey, (err, secret) => {
    if (err || !token) return res.status(401).send(response(false, null, 'Unauthorized.'))
    req.secret = secret
    next()
  })
}
