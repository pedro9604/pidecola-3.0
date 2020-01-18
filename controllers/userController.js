const bcrypt = require('bcryptjs')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../models/userModel.js')

const BCRYPT_SALT_ROUNDS = 12

const registerRules = {
  email: 'required|email',
  password: 'required|string',
  phoneNumber: 'required|string'
}

const create = (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({ email: email, password: password, phone_number: phoneNumber })
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, registerRules)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Error in request.'))

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(function (hashedPassword) {
      req.body.password = hashedPassword
      return create(req.body)
    })
    .then((usr) => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'User created.'))
    })
    .catch(err => {
      return res.status(500).send(response(false, err, 'User not created.'))
    })
}
