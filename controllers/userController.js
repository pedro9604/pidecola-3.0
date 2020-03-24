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
 * @require lib/utils/emails.sendEmail
 * @require lib/utils/codeTemplate.template
 */

const bcrypt = require('bcryptjs')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const autentication = require('../autentication.js')
const users = require('../models/userModel.js')
const sendEmail = require('../lib/utils/emails').sendEmail
const template = require('../lib/utils/codeTemplate').template
const files = require('../lib/cloudinaryConfig.js')

/**
 * Función que modifica el código de confirmación del proceso de registro.
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
 * Función que genera el código de confirmación del proceso de registro.
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
 * Función que envia el correo de confirmacion para completar el proceso de
 * registro.
 * @function
 * @async
 * @private
 * @param {Object} usr
 * @param {Object} res
 * @param {boolean} [already]
 * @returns {Object}
 */
const responseCreate = async (usr, res, already = false) => {
  const code = already ? codeGenerate() : usr.temporalCode
  if (already) await updateCode(usr.email, code)

  sendEmail(usr.email, 'Bienvenido a Pide Cola USB, valida tu cuenta.', createHTMLRespose(code, usr.email.split('@')[0]))
    .then(() => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'Usuario creado.'))
    })
    .catch(error => {
      console.log('Error Sending Mail', error)
      return res.status(500).send(response(false, error, 'Perdón, ocurrió un error.'))
    })
}

/**
 * Función que actualiza un documento de Usuario dado el email asociado.
 * @function
 * @private
 * @param {String} email
 * @param {Object} query
 * @returns {Object}
 */

const updateUserByEmail = (email, query) => {
  return users.findOneAndUpdate({ email: email }, query, { returnOriginal: false })
}

/**
 * Función que realiza una consulta en la BD para buscar un usuario dado su
 * email.
 * @function
 * @async
 * @private
 * @param {String} email
 * @param {Boolean} isVerify
 * @param {Object} querySelect
 * @returns {Object}
 */

exports.findByEmail = async (email, isVerify = true, querySelect = { password: 0 }) => {
  return users.findOne({ email: email, isVerify: isVerify }, querySelect).then((sucs, err) => {
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
exports.getPic = async (email) => {
  return await findByEmail(email).profile_pic
}

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
 * @property {string} 'required.email' - Caso: Omisión o error del email
 * @property {string} 'required.password' - Caso: Omisión del password
 * @property {string} 'required.phoneNumber' - Caso: Omisión del phoneNumber
 * @constant
 * @private
 */
const errorsMessage = {
  'required.email': 'El correo electrónico de la USB es necesario.',
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
const create = async (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({
    email: email,
    password: password,
    phone_number: phoneNumber,
    temporalCode: codeGenerate()
  }).then((sucs, err) => {
    if (!err) return sucs
    return err
  })
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

  const alreadyRegister = await this.findByEmail(req.body.email, false)

  if(alreadyRegister) {
    if (alreadyRegister.isVerify) {
      return res.status(403).send(response(false, '', 'El usuario ya se encuentra registrado.'))
    } else {
      if (!alreadyRegister.isVerify) {
        return responseCreate(alreadyRegister, res, true)
      }
    }
  }

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(async hashedPassword => {
      req.body.password = hashedPassword
      return await create(req.body)
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

/**
 * Endpoint para modificar datos de usuario (nombre, apellido, edad, tlf y carrera)
 * en la BD.
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */

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
      const data = {
          operation: 'update-user',
          collection_name: 'users',
          user: usr.email,
          message: 'Updated user profile',
     }
      usr.log(data)
      return res.status(200).send(response(true, usr, 'El Usuario fue actualizado.'))
    })
    .catch(err => {
      return res.status(500).send(response(false, err, 'Error, El usuario no fue actualizado.'))
    })
}

/**
 * Endpoint para agregar foto de perfil en el perfil de usuario
 * Se utiliza Cloudinary y Multer para el manejo y almacenamiento
 * de imagenes. En la BD se almacena el URL de Cloudinary donde se 
 * encuentra la imagen  
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */

exports.updateProfilePic = (req, res) => {
  const email = req.secret.email
  const file = req.file
  if(!file) return res.status(401).send(response(false, '', 'File is required'))
  if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))

  this.findByEmail(email)
  .then( async user => {

    let picture = await files.uploadFile(file.path)
    if(!picture) return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe.'))

    user.$set({
      profile_pic: picture.secure_url
    })

    user.save( (err, usr) => {
      if(err) return res.status(500).send(response(false, err, 'Foto de perfil no fue agregada'))
      return res.status(200).send(response(true, usr, 'Foto de perfil agregada'))
    })
    
  })
  .catch( error => {
    return res.status(500).send(response(false, error, 'Foto de perfil no fue agregada'))
  })
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * registrar un vehiculo.
 * @name registerRules
 * @type {Object}
 * @property {string} plate 
 * @property {string} brand 
 * @property {string} model
 * @property {string} year
 * @property {string} color
 * @property {string} vehicle_capacity
 * @constant
 * @private
 */

const addVehicleRules = {
  plate: 'required|string',
  brand: 'required|string',
  model: 'required|string',
  year: 'required|string',
  color: 'required|string',
  vehicle_capacity: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las addVehiclesRules en una
 * solicitud.
 * @name errorsMessage
 * @type {Object}
 * @property {string} 'required.plate' - Caso: Omisión o error de placa
 * @property {string} 'required.brand' - Caso: Omisión de la marca
 * @property {string} 'required.model' - Caso: Omisión del modelo
 * @property {string} 'required.year' - Caso: Omisión del año
 * @property {string} 'required.color' - Caso: Omisión del color
 * @property {string} 'required.vehicle_capacity' - Caso: Omisión de la capacidad
 * @constant
 * @private
 */

const errorsMessageAddVehicle = {
  'required.plate': 'La placa de el vehiculo es necesaria.',
  'required.brand': 'La marca del vehiculo es necesaria.',
  'required.model': 'El modelo del vehiculo es  necesario.',
  'required.year': 'El año del vehiculo es  necesario.',
  'required.color': 'El color del vehiculo es  necesario.',
  'required.vehicle_capacity': 'La capacidad del vehiculo es  necesaria.',
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * Endpoint para agregar vehiculo en la base de datos. Se actualiza el 
 * respectivo documento de usuario agregando un elemento en el arreglo 
 * vehiculo. 
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
exports.addVehicle = (req, res) => {
  const email = req.secret.email
  const file = req.file
  if(!file) return res.status(401).send(response(false, '', 'File is requires'))
  if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))

  const validate = validateIn(req.body, addVehicleRules, errorsMessageAddVehicle)
  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Los campos requeridos deben ser enviados.'))

  this.findByEmail(email)
  .then( async user => {
    let existVehicle
    if(user.vehicles && user.vehicles.length)existVehicle = user.vehicles.find( vehicle => vehicle.plate === req.body.plate)
    else user.vehicles = []
    
    if(existVehicle) return res.status(403).send(response(false, error, 'Vehiculo ya existe.')) 

    let picture = await files.uploadFile(file.path)
    if(!picture) return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe.'))

    user.vehicles.push({
      plate: req.body.plate,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
      color: req.body.color,
      vehicle_capacity: req.body.vehicle_capacity,
      vehicle_pic: picture.secure_url
    })

    user.markModified('vehicles')
    user.save( (err, usr) => {
      if(err) return res.status(500).send(response(false, err, 'Vehiculo no fue agregado'))
      return res.status(200).send(response(true, usr, 'Vehiculo agregado.'))
    })
    
  })
  .catch( error => {
    return res.status(500).send(response(false, error, 'Vehiculo no fue agregado'))
  })
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
exports.codeValidate = async (req, res) => {
  const { code, email } = req.body
  if (!code) res.status(403).send(response(false, '', 'El codigo es necesario.'))
  if (!email) res.status(401).send(response(false, '', 'El email es necesario.'))

  const user = await this.findByEmail(email, false)
  if (!user) res.status(401).send(response(false, '', 'El usuario no fue encontrado, debe registrarse nuevamente.'))
  if (user.temporalCode !== parseInt(code)) return res.status(401).send(response(false, '', 'El codigo es incorrecto.'))
  user.isVerify = true
  user.markModified('isVerify')
  user.save()
  return res.status(200).send(response(true, [{ tkauth: autentication.generateToken(user.email) }], 'Success.'))
}


/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * Endpoint que realiza una consulta sobre la colección Usuario
 * para mostrar todos los datos asociados a un usuario dado su email.
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */

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
