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
const bcrypt        = require('bcryptjs')
const files         = require('../lib/cloudinaryConfig')
const users         = require('../models/userModel')

// Funciones
const addVehicleRules   = require('../lib/utils/validation').addVehicleRules
const addVehicleMessage = require('../lib/utils/validation').addVehicleMessage
const callback          = require('../lib/utils/utils').callbackReturn
const deleteRules       = require('../lib/utils/validation').deleteRules
const deleteMessage     = require('../lib/utils/validation').deleteMessage
const registerMessage   = require('../lib/utils/validation').registerMessage
const registerRules     = require('../lib/utils/validation').registerRules
const response          = require('../lib/utils/response').response
const sendEmail         = require('../lib/utils/emails').sendEmail
const template          = require('../lib/utils/codeTemplate').template
const updateRules       = require('../lib/utils/validation').updateRules
const updateMessage     = require('../lib/utils/validation').updateMessage
const validateIn        = require('../lib/utils/validation').validateIn

///////////////////////////////////////////////////////////////////////////////
////////////////////////// Endpoint Crear un usuario //////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para crear un nuevo usuario.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function create(req, res) {
  const validate = validateIn(req.body, registerRules, registerMessage)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Ha ocurrido un error en el proceso'))

  const alreadyRegister = await findByEmail(req.body.email)

  if(alreadyRegister) {
    if (alreadyRegister.isVerify) {
      return res.status(403).send(response(false, '', 'El usuario ya se encuentra registrado'))
    } else {
      if (!alreadyRegister.isVerify) {
        return responseCreate(alreadyRegister, res, true)
      }
    }
  }

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(hashedPassword => {
      req.body.password = hashedPassword
      return addUser(req.body)
    })
    .then(usr => {
      return responseCreate(usr, res)
    })
    .catch(err => {
      let mssg = 'Usuario no ha sido creado'
      if (!!err && err.code && err.code === 11000) mssg = 'Ya existe usuario'
      return res.status(500).send(response(false, err, mssg))
    })
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
function findByEmail(email, querySelect = { password: 0 }) {
  return users.findOne({ email: email }, querySelect)
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
async function responseCreate(usr, res, already = false) {
  const code = already ? codeGenerate() : usr.temporalCode

  if (already) await updateCode(usr.email, code)

  sendEmail(usr.email, 'Bienvenido a Pide Cola USB, valida tu cuenta', createHTMLRespose(code, usr.email.split('@')[0]))
    .then(() => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'Usuario creado'))
    })
    .catch(error => {
      console.log('Error Sending Mail', error)
      return res.status(500).send(response(false, error, 'Perdón, ocurrió un error'))
    })
}

/**
 * Función que genera el código de confirmación del proceso de registro.
 * @function
 * @private
 * @returns {integer}
 */
function codeGenerate() {
  return Math.floor(Math.random() * (99999 - 9999)) + 9999
}

/**
 * Función que modifica el código de confirmación del proceso de registro.
 * @function
 * @async
 * @private
 * @param {string} email
 * @param {integer} [code]
 * @returns {Object|undefined}
 */
async function updateCode(email, code = undefined) {
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
 * Función que crea una respuesta HTML.
 * @function
 * @private
 * @param {integer} code
 * @param {string} [userName]
 * @returns {integer}
 */
function createHTMLRespose(code, userName = '') {
  const html = template(code, userName)
  return html
}

/**
 * Número de veces que son calculados los BCrypt hash.
 * @const
 * @type {integer}
 */
const BCRYPT_SALT_ROUNDS = 12

/**
 * Función que agrega un usuario a la base de datos.
 * @private
 * @param {Object} dataUser
 * @returns {Query} información del usuario agregada a la base de datos
 */
function addUser(dataUser) {
  const { email, password, phoneNumber } = dataUser
  // if (email.split("@")[1] !== "usb.ve") return err 
  const data = {
    email: email,
    password: password,
    phone_number: phoneNumber,
    temporalCode: codeGenerate()
  }
  return users.create(data)//.then(callback)
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
async function codeValidate(req, res) {
  const { code, email } = req.body
  if (!code) return res.status(403).send(response(false, '', 'El código es necesario'))
  if (!email) return res.status(401).send(response(false, '', 'El email es necesario'))

  const user = await findByEmail(email).then(user => {
    if (!user) return 404
    if(user.isVerify) return 400
    if (user.temporalCode !== parseInt(code)) return 401
    user.isVerify = true
    user.markModified('isVerify')
    user.save()
    return 200
  }).catch(error => { return 500 })

  if (user === 200) {
    return res.status(200).send(response(true, [{ tkauth: autentication.generateToken(user.email) }], 'Usuario verificado'))
  } else if (user === 404) {
    return res.status(401).send(response(false, 'Usuario no existe', 'El usuario debe registrarse primero'))
  } else if (user === 400) {
    return res.status(401).send(response(false, 'Verificado', 'El usuario ya se encuentra verificado'))
  } else if (user === 401) {
    return res.status(401).send(response(false, 'Código no coincide', 'El código es incorrecto'))
  } else {
    return res.status(500).send(response(false, 'Error interno', 'Ha ocurrido un error desconocido, por favor intente nuevamente'))
  }
}

///////////////////////////////////////////////////////////////////////////////
////////////////////// Endpoint Ver perfil de un usuario //////////////////////
///////////////////////////////////////////////////////////////////////////////

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
async function getUserInformation(req, res) {
  const validate = validateIn(req.secret, {'email': 'required|email'}, {'required.email': 'El e-mail es necesario'})
  if (!validate.pass) return res.status(401).send(response(false, validate.errors, 'Los datos no cumplen con el formato requerido'))
  const usr = await findByEmail(req.secret.email).then(callback)
  users.deleteOne({ email: 'fjmarquez199@gmail.com' }).then(s => { return s })
  if (!!usr && usr.isVerify) {
    return res.status(200).send(response(true, usr, 'Peticion ejecutada con exito'))
  } else {
    return res.status(500).send(response(false, null, 'Error, El usuario no existe'))
  }
    // .catch(err => {
    //   return res.status(500).send(response(false, err, 'Error, El usuario no fue encontrado o hubo un problema'))
    // })

}

///////////////////////////////////////////////////////////////////////////////
///////////////// Endpoint Actualizar el perfil de un usuario /////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para modificar datos de usuario (nombre, apellido, edad, tlf y carrera)
 * en la BD.
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function updateUser(req, res) {
  const validate = validateIn(req, updateRules, updateMessage)
  if (!validate.pass) return res.status(401).send(response(false, validate.errors, 'Los datos no cumplen con el formato requerido'))
  const query = {
    $set: {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      age: req.body.age,
      phone_number: req.body.phone_number,
      major: req.body.major
    }
  }
  const usr = await updateUserByEmail(req.secret.email, query).then(callback)
  if (!!usr && usr.isVerify) {
    return res.status(200).send(response(true, usr, 'El Usuario fue actualizado'))
  } else if (!usr.isVerify) {
    return res.status(500).send(response(false, 'El usuario no ha sido verificado', 'Para editar el perfil debes estar verificado'))
  } else {
    return res.status(500).send(response(false, null, 'El Usuario no existe'))
  }
    // .catch(err => {
      // return res.status(500).send(response(false, err, 'Error, El usuario no fue actualizado'))
    // })
}

/**
 * Función que actualiza un documento de Usuario dado el email asociado.
 * @function
 * @private
 * @param {String} email
 * @param {Object} query
 * @returns {Object}
 */
function updateUserByEmail(email, query) {
  return users.findOneAndUpdate({ email: email }, query, { returnOriginal: false, useFindAndModify: false, projection: {password: 0} })
}

///////////////////////////////////////////////////////////////////////////////
///////////// Endpoint Actualizar la foto de perfil de un usuario /////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para agregar foto de perfil en el perfil de usuario. Se utiliza
 * Cloudinary y Multer para el manejo y almacenamiento de imágenes. En la BD
 * se almacena el URL de Cloudinary donde se encuentra la imagen  
 * @function
 * @async
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function updateProfilePic(req, res) {
  const validate = validateIn(req.secret, {'email': 'required|email'}, {'required.email': 'El e-mail es necesario'})
  if (!validate.pass) return res.status(401).send(response(false, validate.errors, 'Los datos no cumplen con el formato requerido'))
  const file = req.file
  if(!file) return res.status(401).send(response(false, '', 'File is required'))

  const usr = await findByEmail(req.secret.email)
  .then( async user => {

    let picture = await files.uploadFile(file.path)
    // if(!picture) return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe'))
    if (!picture) return 500

    user.$set({
      profile_pic: picture.secure_url
    })

    user.save( (usr, err) => { return usr
      // if(!err) return res.status(200).send(response(true, usr, 'Foto de perfil agregada'))
      if (!err) return 200
      // return res.status(500).send(response(false, err, 'Foto de perfil no fue agregada'))
      return 501
    })

    return 200
    
  })
  .catch( error => {
    return 502
    // return res.status(500).send(response(false, error, 'Foto de perfil no fue agregada'))
  })

  if (usr == 200) {
    return res.status(200).send(response(true, usr, 'Foto de perfil agregada'))
  } else if (usr == 500) {
    return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe'))
  } else {
    return res.status(500).send(response(false, 'Error', 'Foto de perfil no fue agregada'))
  }
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
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function addVehicle(req, res) {
  if(!req.file) return res.status(401).send(response(false, '', 'File is requires'))

  const validate = validateIn(req, addVehicleRules, addVehicleMessage)
  if (!validate.pass) return res.status(401).send(response(false, validate.errors, 'Los campos requeridos deben ser enviados'))

  const usr = await findByEmail(req.secret.email)
  .then( async user => {
    let existVehicle
    if(user.vehicles && user.vehicles.length)existVehicle = user.vehicles.find( vehicle => vehicle.plate === req.body.plate)
    else user.vehicles = []
    
    // if(existVehicle) return res.status(403).send(response(false, error, 'Vehiculo ya existe'))
    if (existVehicle) return 403

    let picture = await files.uploadFile(req.file.path)
    // if(!picture) return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe'))
    if (!picture) return 500

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
    user.save( (usr, err) => {
      // if(!err) return res.status(200).send(response(true, usr, 'Vehiculo agregado'))
      if(!err) return 200
      // return res.status(500).send(response(false, err, 'Vehiculo no fue agregado'))
      return 501
    })
    
  })
  .catch( error => {
    // return res.status(500).send(response(false, error, 'Vehiculo no fue agregado'))
    return 502
  })
  if (usr === 200) {
    return res.status(200).send(response(true, usr, 'Vehiculo agregado'))
  } else if (usr === 403) {
    return res.status(403).send(response(false, error, 'Vehiculo ya existe'))
  } else if (usr == 500) {
    return res.status(500).send(response(false, '', 'Ocurrio un error en el proceso, disculpe'))
  } else if (usr == 501) {
    return res.status(500).send(response(false, err, 'Vehiculo no fue agregado'))
  } else {
    return res.status(500).send(response(false, error, 'Vehiculo no fue agregado'))
  }
}

///////////////////////////////////////////////////////////////////////////////
///////////// Endpoint Eliminar vehículo del perfil de un usuario /////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para eliminar un vehiculo asociado a un 
 * documento de usuario dado la placa del vehiculo
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function deleteVehicle(req, res) {
  const validate = validateIn(req, deleteRules, deleteMessage)
  if (!validate.pass) return res.status(401).send(response(false, validate.errors, 'Los datos no cumplen con el formato requerido'))

  const usr = await findByEmail(req.secret.email)
  .then( async user => {

    let existVehicle = user.vehicles.map(vehicle => vehicle.plate === req.body.plate)
    if(!existVehicle) return res.status(403).send(response(false, error, 'Vehiculo no existe'))

    user.updateOne({'$pull': {'vehicles': {plate: req.body.plate}}}, (err, usr) => {
      if(err) return res.status(500).send(response(false, err, 'Vehiculo no fue eliminado'))
      return res.status(200).send(response(true, usr, 'Vehiculo eliminado'))
    })
    
  })
  .catch( error => {
    return res.status(500).send(response(false, error, 'Vehiculo no fue eliminado'))
  })

  if (usr === 200) {
    return res.status(200).send(response(true, usr, 'Vehiculo eliminado'))
  } else if (usr === 403) {
     return res.status(403).send(response(false, error, 'Vehiculo no existe'))
  } else if (usr === 500) {
    return res.status(500).send(response(false, err, 'Vehiculo no fue eliminado'))
  } else {
    return res.status(500).send(response(false, error, 'Vehiculo no fue eliminado'))
  }
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////// Exportar Endpoints ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports.create             = create
module.exports.findByEmail        = findByEmail // Esto no es un endpoint
module.exports.codeValidate       = codeValidate
module.exports.getUserInformation = getUserInformation
module.exports.updateUser         = updateUser
module.exports.updateProfilePic   = updateProfilePic
module.exports.addVehicle         = addVehicle
module.exports.deleteVehicle      = deleteVehicle