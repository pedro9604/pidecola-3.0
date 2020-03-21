/**
 * Este módulo contiene los métodos para manejar la información de los
 * usuarios del sistema PideCola. Para conocer los datos que se almacenan por
 * usuario, ver manual de la base de datos.
 * @module controllers/userController
 * @author Ángel Morante <13-10931@usb.ve>
 * @author Francisco Márquez <12-11163@usb.ve>
 * @author Pedro Madolnado <13-10790@usb.ve>
 * @require bcryptjs
 * @require cloudinary
 * @require lib/utils/validation.validateIn
 * @require lib/utils/response.response
 * @require autentication.js
 * @require models/rideModel.js
 * @require lib/cloudinaryConfig.js.upload
 * @require lib/utils/emails').sendEmail
 * @require lib/utils/codeTemplate.template
 */

const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const autentication = require('../autentication.js')
const users = require('../models/userModel.js')
const upload = require('../lib/cloudinaryConfig.js').upload
const sendEmail = require('../lib/utils/emails').sendEmail
const template = require('../lib/utils/codeTemplate').template

/**
 * Número de veces que son calculados los BCrypt hash.
 * @const
 * @type {integer}
 */
const BCRYPT_SALT_ROUNDS = 12

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * registrar a un usuario en la base de datos.
 * @name registerRules
 * @type {Object}
 * @property {string} email - Campo email de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} password - Campo password de la solicitud es obligatorio
 * @property {string} phoneNumber - Campo phoneNumber de la solicitud es
 * obligatorio
 * @constant
 * @private
 */
const registerRules = {
  email: 'required|email',
  password: 'required|string',
  phoneNumber: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las registerRules en una
 * solicitud.
 * @name errorsMessage
 * @type {Object}
 * @property {string} 'required.rider' - Caso: Omisión o error del rider
 * @property {string} 'required.password' - Caso: Omisión del password
 * @property {string} 'required.phoneNumber' - Caso: Omisión del phoneNumber
 * @constant
 * @private
 */
const errorsMessage = {
  'required.email': 'El correo electrónico de la usb es necesario.',
  'required.password': 'La contraseña es necesaria.',
  'required.phoneNumber': 'El teléfono celular es necesario.'
}

/**
 * Función que agrega un usuario a la base de datos.
 * @function
 * @private
 * @param {Object} dataUser
 * @returns {Object} información del usuario agregada a la base de datos
 */
const create = (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({
    email: email,
    password: password,
    phone_number: phoneNumber,
    temporalCode: codeGenerate()
  })
}

/**
 * Función que modifica el código de confirmación.
 * @function
 * @async
 * @private
 * @param {string} email
 * @param {integer} [code]
 * @returns {Object|undefined}
 */
const updateCode = async (email, code = undefined) => {
  const query = { email: email }
  const update = {
    $set: {
      temporalCode: code || codeGenerate()
    }
  }
  return users.updateOne(query, update)
    .then(usr => {
      return usr
    })
    .catch(err => {
      console.log('Error in update code: ', err)
    })
}

/**
 * Función que genera el código de confirmación.
 * @function
 * @private
 * @returns {integer}
 */
const codeGenerate = () => {
  return Math.floor(Math.random() * (99999 - 9999)) + 9999
}

/**
 * Función que crea una respuesta HTML.
 * @function
 * @private
 * @param {integer} code
 * @param {string} [userName]
 * @returns {integer}
 */
const createHTMLRespose = (code, userName = '') => {
  const html = template(code, userName)
  return html
}

/**
 * Función que crea una respuesta.
 * @function
 * @async
 * @private
 * @param {Object} usr
 * @param {Object} res
 * @param {boolean} [alredy]
 * @returns {Object}
 */
const responseCreate = async (usr, res, alredy = false) => {
  const code = alredy ? codeGenerate() : usr.temporalCode
  if (alredy) await updateCode(usr.email, code)

  sendEmail(usr.email, 'Bienvenido a Pide Cola USB, valida tu cuenta.', createHTMLRespose(code, usr.email.split('@')[0]))
    .then(() => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'Usuario creado.'))
    })
    .catch(error => {
      console.log('Error Sendig Mail', error)
      return res.status(500).send(response(false, error, 'Perdon, ocurrio un error.'))
    })
}

const updateUserByEmail = (email, query) => {
  return users.findOneAndUpdate({ email: email }, { password: 0, ...query }, { returnOriginal: false })
}

exports.findByEmail = async (email, querySelect = { password: 0 }) => {
  return users.findOne({ email: email }, querySelect).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
}

/**
 * Función que devuelve la foto de perfil de un usuario de la base de datos.
 * @function
 * @public
 * @param {string} email
 * @returns {Object}
 */
exports.getPic = (email) => {
  return users.findOne({ email: email }).select('profile_pic')
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
exports.create = async (req, res) => {
  const validate = validateIn(req.body, registerRules, errorsMessage)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Ha ocurrido un error en el proceso'))

  const alredyRegister = await this.findByEmail(req.body.email)

  // if(alredyRegister)
  if (alredyRegister && alredyRegister.isVerify) return res.status(403).send(response(false, '', 'El usuario ya se encuentra registrado.'))
  else if (alredyRegister && !alredyRegister.isVerify) return responseCreate(alredyRegister, res, true)

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
exports.updateUser = (req, res) => {
  const email = req.secret.email
  if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
  const query = {
    $set: {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      age: req.body.age,
      phone_number: req.body.phone_number,
      major: req.body.major
    }
  }
  updateUserByEmail(email, query)
    .then(usr => {
      return res.status(200).send(response(true, usr, 'El Usuario fue actualizado.'))
    })
    .catch(err => {
      return res.status(500).send(response(false, err, 'Error, El usuario no fue actualizado.'))
    })
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
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

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
exports.codeValidate = async (req, res) => {
  const { code, email } = req.body
  if (!code) res.status(403).send(response(false, '', 'El codigo es necesario.'))
  if (!email) res.status(401).send(response(false, '', 'El email es necesario.'))

  const user = await this.findByEmail(email)
  if (!user) res.status(401).send(response(false, '', 'El usuario no fue encontrado, debe registrarse nuevamente.'))
  if (user.temporalCode !== parseInt(code)) return res.status(401).send(response(false, '', 'El codigo es incorrecto.'))
  user.isVerify = true
  user.markModified('isVerify')
  user.save()
  return res.status(200).send(response(true, [{ tkauth: autentication.generateToken(user.email) }], 'Success.'))
}

exports.getUserInformation = (req, res) => {
  const email = req.secret.email
  if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
  this.findByEmail(email)
    .then(usr => {
      return res.status(200).send(response(true, usr, 'Peticion ejecutada con exito.'))
    })
    .catch(err => {
      return res.status(500).send(response(false, err, 'Error, El usuario no fue encontrado o hubo un problema.'))
    })
}
