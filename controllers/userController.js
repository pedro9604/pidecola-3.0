/**
 * Este módulo contiene los métodos para manejar la información de los
 * usuarios del sistema PideCola. Para conocer los datos que se almacenan por
 * usuario, ver manual de la base de datos.
 * @module userController
 * @author Ángel Morante <13-10931@usb.ve>
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

///////////////////////////////////////////////////////////////////////////////
//////////////////////// Módulos, funciones requeridas ////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Módulos
const autentication = require('../autentication')
const bcrypt = require('bcryptjs')
const files = require('../lib/cloudinaryConfig')
const logger = require('../lib/logger.js')
const users = require('../models/userModel')

// Funciones
const addVehicleRules = require('../lib/utils/validation').addVehicleRules
const addVehicleMessage = require('../lib/utils/validation').addVehicleMessage
const callback = require('../lib/utils/utils').callbackReturn
const callbackMail = require('../lib/utils/utils').callbackMail
const deleteRules = require('../lib/utils/validation').deleteRules
const deleteMessage = require('../lib/utils/validation').deleteMessage
const emailRules = require('../lib/utils/validation').emailRules
const jwt = require('jsonwebtoken')
const emailMessage = require('../lib/utils/validation').emailMessage
const registerMessage = require('../lib/utils/validation').registerMessage
const registerRules = require('../lib/utils/validation').registerRules
const response = require('../lib/utils/response').response
const resetTemplate = require('../lib/utils/codeTemplate').resetPasswordTemplate
const sendEmail = require('../lib/utils/emails').sendEmail
const template = require('../lib/utils/codeTemplate').template
const tokenKey = process.env.KEY
const updateRules = require('../lib/utils/validation').updateRules
const updateMessage = require('../lib/utils/validation').updateMessage
const validateIn = require('../lib/utils/validation').validateIn

///////////////////////////////////////////////////////////////////////////////
////////////////////////// Endpoint Crear un usuario //////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para crear un nuevo usuario. El número de veces que son calculados
 * los BCrypt hash es 12
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function create (req, res) {
  const { code, status, errors, message } = await verifyCreate(req.body)
  if (!status) {
    logger.log('error', message, {user: req.body.email, operation: 'create', status: code})
    return res.status(code).send(response(false, errors, message))
  }
  req.body.password = await bcrypt.hash(req.body.password, 12)
  const user = await addUser(req.body).then((sucs, err) => {
    if (!err && sucs) return { code: 200, user: sucs }
    return { code: err.code === 11000 ? 11000 : 500, user: null }
  })
  let mssg
  if (user.code === 200) {
    const create = await responseCreate(user.user)
    if (!create.sent) {
      mssg = 'No se ha podido enviar el código de validación. Intente de nuevo'
      logger.log('error', mssg, {user: req.body.email, operation: 'create', status: 500})
      return res.status(500).send(response(false, create.errors, mssg))
    } else {
      mssg = 'Usuario creado con éxito. El código de validación se ha enviado '
      mssg += 'a su correo'
      logger.log('info', mssg, {user: req.body.email, operation: 'create', status: 200})
      return res.status(200).send(response(true, create.log, mssg))
    }
  } else if (user.code === 11000) {
    mssg = 'El usuario ya existe'
    logger.log('error', mssg, {user: req.body.email, operation: 'create', status: 500})
    return res.status(500).send(response(false, 'Ya existe usuario', mssg))
  } else {
    mssg = 'El usuario no ha sido creado debido a un error desconocido'
    logger.log('error', mssg, {user: req.body.email, operation: 'create', status: 500})
    return res.status(500).send(response(false, 'Error', mssg))
  }
}

/**
 * Función que verifica la validez de los datos de una solicitud para
 * crear un nuevo usuario.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} dataRegister
 * @returns {Verification}
 */
async function verifyCreate (dataRegister) {
  const validate = validateIn(dataRegister, registerRules, registerMessage)
  var code = 0
  var err = ''
  var message = ''
  if (dataRegister.email.split('@')[1] !== 'usb.ve') {
    code = 400
    err = 'Correo invalido'
    message = 'Correo debe ser usb.ve'
    return { code: code, status: false, errors: err, message: message }
  }
  const user = await findByEmail(dataRegister.email)
  if (!(validate.pass && !user)) {
    if (!validate.pass) {
      code = 400
      err = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (user.isVerify) {
      code = 403
      err = 'Usuario registrado'
      message = 'Usuario ya se ha registrado exitosamente'
    } else {
      code = 409
      err = 'Usuario debe validarse'
      message = 'El usuario debe ingresar código enviado a su e-mail'
      const { sent, errors } = await responseCreate(user, true)
      if (!sent) {
        code = 500
        err = errors
        message = 'El usuario debía validarse pero ocurrió un error reenviando'
        message += ' el correo con el código de validación'
      }
    }
    return { code: code, status: false, errors: err, message: message }
  }
  return { code: 200, status: true, errors: '', message: '' }
}

/**
 * Función que realiza una consulta en la BD para buscar un usuario dado su
 * email.
 * @async
 * @private
 * @param {String} email
 * @param {Object} querySelect
 * @returns {Query}
 */
async function findByEmail (email, querySelect = { password: 0 }) {
  return users.findOne({ email: email }, querySelect)
}

/**
 * Función que envia el correo de confirmacion para completar el proceso de
 * registro.
 * @async
 * @private
 * @param {Object} usr
 * @param {boolean} [already]
 * @returns {Object}
 */
async function responseCreate (usr, already = false) {
  const to = usr.email
  const sb = 'Bienvenido a Pide Cola USB, valida tu cuenta'
  let code
  if (already) {
    code = Math.floor(Math.random() * 90000) + 9999
    await updateCode(usr.email, code)
  } else {
    code = usr.temporalCode
  }
  return sendEmail(to, sb, template(code, to.split('@')[0])).then(callbackMail)
}

/**
 * Función que modifica el código de confirmación del proceso de registro.
 * @function
 * @private
 * @param {string} email
 * @param {integer} [code]
 * @returns {Object|undefined}
 */
async function updateCode (email, code = undefined) {
  const query = { email: email }
  const update = {
    $set: { temporalCode: code || Math.floor(Math.random() * 90000) + 9999 }
  }
  return users.updateOne(query, update, callback)
}

/**
 * Función que agrega un usuario a la base de datos.
 * @private
 * @param {Object} dataUser
 * @returns {Query} información del usuario agregada a la base de datos
 */
function addUser (dataUser) {
  const { email, password, phoneNumber } = dataUser
  const data = {
    email: email,
    password: password,
    phone_number: phoneNumber,
    temporalCode: Math.floor(Math.random() * 90000) + 9999
  }
  return users.create(data)
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Endpoint Validar un usuario /////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para validar un usuario vía código enviado por e-mail.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function codeValidate (req, res) {
  var status, err, message
  if (!(req.body.code && req.body.email)) {
    err = 'El código es necesario. El email es necesario'
    message = 'Los datos introducidos no cumplen con el formato requerido'
    if (!req.body.code && !req.body.email) {
      status = 400
    } else if (!req.body.code) {
      err = 'El código es necesario'
      status = 403
    } else {
      err = 'El email es necesario'
      status = 401
    }
    logger.log('error', message, {user: req.body.email, operation: 'code-validation', status: status})
    return res.status(status).send(response(false, err, message))
  }
  const user = await findByEmail(req.body.email).then(user => {
    if (!user) return { code: 404, data: 'Usuario no existe' }
    if (user.isVerify) return { code: 400, data: 'Verificado' }
    if (user.temporalCode !== parseInt(req.body.code)) {
      return { code: 401, data: 'Código no coincide' }
    }
    user.isVerify = true
    user.markModified('isVerify')
    user.save()
    const token = autentication.generateToken(user.email)
    return { code: 200, data: [{ tkauth: token }] }
  }).catch(error => { return { code: 500, data: error } })
  status = user.code === 200 || user.code === 500 ? user.code : 401
  if (user.code === 200) {
    message = 'Usuario verificado'
  } else if (user.code === 404) {
    message = 'El usuario debe registrarse primero'
  } else if (user.code === 400) {
    message = 'El usuario ya se encuentra verificado'
  } else if (user.code === 401) {
    message = 'El código es incorrecto'
  } else {
    message = 'Ha ocurrido un error desconocido, por favor intente nuevamente'
  }
  logger.log('info', message, {user: req.body.email, operation: 'code-validation', status: 200})
  return res.status(status).send(response(status === 200, user.data, message))
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////// Endpoint Recuperar Contraseña ///////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint que envia por por email un enlace para reestablecer la contraseña.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */

async function resetPassword (req, res) {
  if (req.body.email.split('@')[1] !== 'usb.ve') {
    logger.log('error', 'Correo invalido', {user: req.body.email, operation: 'reset-pw', status: 500})
    return res.status(500).send(response(false, null, 'Correo invalido'))
  }

  const user = await findByEmail(req.body.email).then(callback)
  if (!user) {
    logger.log('error', 'Usuario no existe', {user: req.body.email, operation: 'reset-pw', status: 500})
    return res.status(500).send(response(false, null, 'Usuario no existe'))
  }
  const token = jwt.sign({ email: req.body.email }, tokenKey, { expiresIn: 3600 })
  const link = `http://localhost:5000/users/update/pw/${user.email}/${token}`
  const {sent, log, errors } = await forgotPasswordEmail(req.body.email, link)
  if (!sent) {
    logger.log('error', 'Correo no pudo ser enviado', {user: req.body.email, operation: 'reset-pw', status: 500})
    return res.status(500).send(response(sent, log, 'Correo no pudo ser enviado'))
  }
  logger.log('info', 'Correo enviado', {user: req.body.email, operation: 'reset-pw', status: 200})
  return res.status(200).send(response(sent, log, 'Correo de Reestablecimiento de Contraseña Enviado'))
}

/**
 * Funcion que envia por correo enlace para reestablecer contraseña.
 * @function
 * @async
 * @public
 * @param {String} email - email destino
 * @param {String} link - enlace para reestablecer contraseña
 * @returns {SentStatus}
 */

async function forgotPasswordEmail (email, link) {
  const subj = 'Reestablecer contraseña'
  const html = resetTemplate(link)
  return sendEmail(email, subj, html).then(callbackMail)
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Endpoint Reestablecer Contraseña ////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint que actualiza la contraseña del usuario a traves del enlace enviado
 * previamente por correo.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */

async function updatePassword (req, res) {
  const { email, token } = req.body
  let password

  const user = await findByEmail(email).then(callback)
  if (!user) {
    logger.log('error', 'Usuario no existe', {user: req.body.email, operation: 'update-pw', status: 500})
    return res.status(500).send(response(false, null, 'Usuario no existe'))
  }

  const secret = tokenKey
  const payload = jwt.decode(token, secret)

  if (payload.email === user.email) {
    password = await bcrypt.hash(req.body.password, 12)
  }

  const query = { $set: { password: password }}
  const newPassword = await updateUserByEmail(email, query).then(callback)
  if (!newPassword) {
    logger.log('error', 'Error al cambiar contraseña', {user: email, operation: 'update-pw', status: 500})
    return res.status(500).send(response(false, newPassword, 'Error al cambiar contraseña'))
  }
  logger.log('info', 'Contraseña cambiada', {user: email, operation: 'update-pw', status: 200})
  return res.status(200).send(response(true, newPassword, 'Contraseña cambiada'))
}


///////////////////////////////////////////////////////////////////////////////
////////////////////// Endpoint Ver perfil de un usuario //////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint que realiza una consulta sobre la colección Usuario para mostrar
 * todos los datos asociados a un usuario dado su email.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function getUserInformation (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  if (!validate.pass) {
    const message = 'Los datos no cumplen con el formato requerido'
    return res.status(401).send(response(false, validate.errors, message))
  }
  const usr = await findByEmail(req.secret.email).then(callback)
  if (!!usr && usr.isVerify) {
    logger.log('info', 'Perfil encontrado', {user: req.secret.email, operation: 'view-profile', status: 200})
    return res.status(200).send(response(true, usr, 'Perfil encontrado'))
  } else {
    logger.log('error', 'Usuario no existe', {user: req.secret.email, operation: 'view-profile', status: 500})
    return res.status(500).send(response(false, null, 'Usuario no existe'))
  }
}

///////////////////////////////////////////////////////////////////////////////
///////////////// Endpoint Actualizar el perfil de un usuario /////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para modificar datos de usuario (nombre, apellido, edad, tlf y carrera)
 * en la BD.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function updateUser (req, res) {
  const validate = validateIn(req, updateRules, updateMessage)
  var message = 'Debes verificar tu cuenta antes', status = 0, data = null, level = null
  if (!validate.pass) {
    level = 'error'
    message = 'Los datos no cumplen con el formato requerido'
    logger.log(level, message, {user: req.secret.email, operation: 'update-profile', status: 401})
    return res.status(401).send(response(false, validate.errors, message))
  }
  const query = { $set: req.body }
  const usr = await updateUserByEmail(req.secret.email, query).then(callback)
  status = usr && usr.isVerify ? 200 : 500
  if (usr && usr.isVerify) {
    data = usr
    message = 'El Usuario fue actualizado'
    level = 'info'
  } else if (!usr.isVerify) {
    data = 'Usuario no ha sido verificado'
    level = 'error'
  } else {
    message = 'El Usuario no existe'
    level = 'error'
  }
  logger.log(level, message, {user: req.secret.email, operation: 'update-profile', status: status})
  return res.status(status).send(response(usr && usr.isVerify, data, message))
}

/**
 * Función que actualiza un documento de Usuario dado el email asociado.
 * @private
 * @param {String} email
 * @param {Object} query
 * @returns {Object}
 */
function updateUserByEmail (email, query) {
  return users.findOneAndUpdate({ email: email }, query, { returnOriginal: false, useFindAndModify: false, projection: { password: 0 } })
}

///////////////////////////////////////////////////////////////////////////////
///////////// Endpoint Actualizar la foto de perfil de un usuario /////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para agregar foto de perfil en el perfil de usuario. Se utiliza
 * Cloudinary y Multer para el manejo y almacenamiento de imágenes. En la BD
 * se almacena el URL de Cloudinary donde se encuentra la imagen
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function updateProfilePic (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  var status = 401, err = '', level = 'error'
  var message = 'Los datos introducidos no cumplen con el formato requerido'
  if (!(req.file && validate.pass)) {
    if (!req.file && !validate.pass) {
      err = validate.errors.push('La foto de perfil es requerida')
    } else if (!validate.pass) {
      err = validate.errors
    } else if (req.fileValidationError) {
      err = 'Formatos de imagenes permitidos: jpg, jpeg y png'
    } else {
      err = 'La foto de perfil es requerida'
    }
    logger.log(level, message, {user: req.secret.email, operation: 'update-profile-pic', status: status})
    return res.status(status).send(response(false, err, message))
  }
  const usr = await findByEmail(req.secret.email)
    .then(async user => {
      const picture = await files.uploadFile(req.file.path)
      if (!picture) return { code: 500, data: 'Error desconocido' }
      user.$set({ profile_pic: picture.secure_url })
      const modified = user.save().then((usr, err) => {
        if (!err) return { code: 200, data: usr }
        return { code: 501, data: err }
      })
      return modified
    })
    .catch(error => { return { code: 500, data: error } })
  status = usr.code === 200 ? 200 : 500
  if (usr.code === 200) message = 'Foto de perfil agregada', level = 'info'
  else if (usr.code === 500) message = 'Ocurrió un error en el proceso', level = 'error'
  else message = 'Foto de perfil no fue agregada', level = 'error'
  logger.log(level, message, {user: req.secret.email, operation: 'update-profile-pic', status: status})
  return res.status(status).send(response(status === 200, usr.data, message))
}

///////////////////////////////////////////////////////////////////////////////
/////////// Endpoint Agregar nuevo vehículo al perfil de un usuario ///////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para agregar un vehículo al perfil de un usuario.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * Endpoint para agregar vehiculo en la base de datos. Se actualiza el
 * respectivo documento de usuario agregando un elemento en el arreglo
 * vehiculo.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function addVehicle (req, res) {
  const validate = validateIn(req, addVehicleRules, addVehicleMessage)
  var status = 401, err = '', level = 'error'
  let message = 'Los datos introducidos no cumplen con el formato requerido'
  if (!(req.file && validate.pass)) {
    if (!req.file && !validate.pass) {
      err = validate.errors.push('La foto del vehículo es requerida')
    } else if (!validate.pass) {
      err = validate.errors
    } else if (req.fileValidationError) {
      err = 'Formatos de imagenes permitidos: jpg, jpeg y png'
    } else {
      err = 'La foto del vehículo es requerida'
    }
    logger.log(level, message, {user: req.secret.email, operation: 'add-vehicle', status: status})
    return res.status(status).send(response(false, err, message))
  }
  const usr = await findByEmail(req.secret.email)
    .then(async user => {
      if (user.vehicles) {
        if (user.vehicles.find(car => car.plate === req.body.plate)) {
          return { code: 403, data: user }
        }
      }
      const picture = await files.uploadFile(req.file.path)
      if (!picture) return { code: 500, data: user }
      req.body.vehicle_pic = picture.secure_url
      user.vehicles.push(req.body)
      user.markModified('vehicles')
      const modified = user.save().then((usr, err) => {
        if (!err) return { code: 200, data: usr }
        return { code: 501, data: err }
      })
      return modified
    })
    .catch(error => { return { code: 502, data: error } })
  status = usr.code === 200 || usr.code === 403 ? usr.code : 500
  if (usr.code === 200) message = 'Vehículo agregado', level = 'info'
  else if (usr.code === 403) message = 'Vehículo ya existe', level = 'error'
  else if (usr.code === 500) message = 'Ocurrió un error en el proceso', level = 'error'
  else message = 'Vehículo no fue agregado', level = 'error'
  logger.log(level, message, {user: req.secret.email, operation: 'add-vehicle', status: status})
  return res.status(status).send(response(status === 200, usr.data, message))
}

///////////////////////////////////////////////////////////////////////////////
///////////// Endpoint Eliminar vehículo del perfil de un usuario /////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para eliminar un vehículo asociado a un documento de usuario dado
 * la placa del vehículo
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function deleteVehicle (req, res) {
  const validate = validateIn(req, deleteRules, deleteMessage)
  var status, message, level
  if (!validate.pass) {
    message = 'Los datos no cumplen con el formato requerido'
    logger.log('error', message, {user: req.secret.email, operation: 'delete-vehicle', status: 401})
    return res.status(401).send(response(false, validate.errors, message))
  }
  const usr = await findByEmail(req.secret.email)
    .then(async user => {
      if (user.vehicles) {
        if (!user.vehicles.find(car => car.plate === req.body.plate)) {
          return { code: 403, data: user }
        }
      } else {
        return { code: 403, data: user }
      }
      const query = { $pull: { vehicles: { plate: req.body.plate } } }
      const modified = user.updateOne(query).then((usr, err) => {
        if (err) return { code: 500, data: err }
        return { code: 200, data: usr }
      })
      return modified
    })
    .catch(error => { return { code: 500, data: error } })
  status = usr.code === 200 || usr.code === 403 ? usr.code : 500
  if (usr.code === 200) message = 'Vehículo eliminado', levvel = 'info'
  else if (usr.code === 403) message = 'Vehículo no existe', level = 'error'
  else message = 'Vehículo no existe', level = 'error'
  logger.log(level, message, {user: req.secret.email, operation: 'delete-vehicle', status: status})
  return res.status(status).send(response(status === 200, usr.data, message))
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////// Exportar Endpoints ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports.create = create
module.exports.findByEmail = findByEmail // Esto no es un endpoint
module.exports.codeValidate = codeValidate
module.exports.getUserInformation = getUserInformation
module.exports.resetPassword = resetPassword
module.exports.updatePassword = updatePassword
module.exports.updateUser = updateUser
module.exports.updateProfilePic = updateProfilePic
module.exports.addVehicle = addVehicle
module.exports.deleteVehicle = deleteVehicle
