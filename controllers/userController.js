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

const errorsMessage = {
  'required.email': "El correo electrónico de la usb es necesario.",
  'required.password': "La contraseña es necesaria.",
  'required.phoneNumber': "El teléfono celular es necesario."
}

const create = (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({
    email: email,
    password: password,
    phone_number: phoneNumber
  })
}

exports.findByEmail = (email) => {
  return users.findOne({ email: email })
}

exports.getPic = (email) => {
  return users.findOne({ email: email }).select('profile_pic')
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, registerRules, errorsMessage)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Ha ocurrido un error en el proceso'))

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(hashedPassword => {
      req.body.password = hashedPassword
      return create(req.body)
    })
    .then(usr => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'Usuario creado.'))
    })
    .catch(err => {
      let mssg = 'Usuario no ha sido creado.'
      if (err && err.code && err.code === 11000) mssg = 'Ya existe usuario.'
      return res.status(500).send(response(false, err, mssg))
    })
}

exports.updateUser = (req, res) => {

  users.findOneAndUpdate({email: req.body.email}, 

    {$set: {
      "first_name": req.body.first_name,
      "last_name": req.body.last_name,
      "age": req.body.age,
      "phone_number": req.body.phone_number,
      "major": req.body.major
      }
    },

    {new: true},
    
    function(error, doc){
      if (error){
        return res.status(500).send(response(false, error, 'Usuario no fue actualizado'))
      }
      else
        return res.status(200).send(response(true, doc, 'Usuario actualizado'))
    })
}