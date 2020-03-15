const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../models/userModel.js')
const upload = require('../lib/cloudinaryConfig.js').upload
const sendEmail = require('../lib/utils/emails').sendEmail
const template = require('../lib/utils/codeTemplate').template

const BCRYPT_SALT_ROUNDS = 12

const registerRules = {
  email: 'required|email',
  password: 'required|string',
  phoneNumber: 'required|string'
}

const errorsMessage = {
  'required.email': 'El correo electrónico de la usb es necesario.',
  'required.password': 'La contraseña es necesaria.',
  'required.phoneNumber': 'El teléfono celular es necesario.'
}

const create = (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({
    email: email,
    password: password,
    phone_number: phoneNumber,
    temporalCode: codeGenerate()
  })
}

const updateCode = (email, code = undefined) => {
  const query = { 'email': email}
  const update = {
    $setOnInsert : {
      temporalCode: code || codeGenerate()
    }
  }
  return users.findOneAndUpdate(query, update)
}

const codeGenerate = () => {
  return Math.floor(Math.random() * (99999 - 9999)) + 9999;
}

const createHTMLRespose = (code, userName = '') => {
  const html = template(code, userName)
  return html
}

const responseCreate = (usr, res, alredy = false) => {
  let code = alredy ? codeGenerate() : usr.temporalCode
  if(alredy) updateCode(usr.email, code)
  sendEmail(usr.email, 'Bienvenido a Pide Cola USB, valida tu cuenta.', createHTMLRespose(code, usr.email.split('@')[0]))
  .then( () => {
    const userInf = { email: usr.email, phoneNumber: usr.phone_number}
    return res.status(200).send(response(true, userInf, 'Usuario creado.'))
  })
  .catch( error => {
    console.log('Error Sendig Mail', error)
  })
}

exports.findByEmail = (email) => {
  return users.findOne({ email: email })
}

exports.getPic = (email) => {
  return users.findOne({ email: email }).select('profile_pic')
}

exports.create = async (req, res) => {
  const validate = validateIn(req.body, registerRules, errorsMessage)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Ha ocurrido un error en el proceso'))

  let alredyRegister = await this.findByEmail(req.body.email)

  // if(alredyRegister)
  if(alredyRegister && alredyRegister.isVerify) return res.status(403).send(response(false, '', 'El usuario ya se encuentra registrado.'))
  else if(alredyRegister && !alredyRegister.isVerify) return responseCreate(alredyRegister, res, true)

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(hashedPassword => {
      req.body.password = hashedPassword
      return create(req.body)
    })
    .then(usr => {
      return responseCreate(usr, res)
    })
    .catch(err => {
      let mssg = 'Usuario no ha sido creado.'
      if (err && err.code && err.code === 11000) mssg = 'Ya existe usuario.'
      return res.status(500).send(response(false, err, mssg))
    })
}

exports.addVehicle = (upload, (req, res) => {
  cloudinary.v2.uploader.upload(req.file, function (picture) {
    users.find({ 'vehicles.plate': req.body.plate }, function (error, result) {
      if (error) { return res.status(500).send(response(false, error, 'Fallo en la busqueda')) } else if (!result.length) {
        users.findOneAndUpdate({ email: req.body.email },

          {
            $push: {
              vehicles: {
                plate: req.body.plate,
                brand: req.body.brand,
                model: req.body.model,
                year: req.body.year,
                color: req.body.color,
                vehicle_capacity: req.body.vehicle_capacity,
                vehicle_pic: picture.secure_url
              }
            }

          },

          { new: true },

          function (error, doc) {
            if (error) {
              return res.status(500).send(response(false, error, 'Vehiculo no fue agregado'))
            } else { return res.status(200).send(response(true, doc, 'Vehiculo agregado.')) }
          })
      } else { return res.status(500).send(response(false, error, 'Vehiculo ya existe')) }
    })
  })
})
