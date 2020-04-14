/**
 * Este módulo contiene los métodos para manejar las colas en la base de datos.
 * Para conocer los datos que se almacenan por cola, ver manual de la base de
 * datos.
 * @module rideController
 * @author Francisco Márquez <12-11163@usb.ve>
 * @require módulo: controllers/userController
 * @require módulo: models/rideModel.js
 * @require lib/utils/utils.callbackReturn
 * @require lib/utils/response.response
 * @require lib/utils/validation.rideMessage
 * @require lib/utils/validation.rideRules
 * @require lib/utils/validation.validateIn
 */

///////////////////////////////////////////////////////////////////////////////
//////////////////////// Módulos, funciones requeridas ////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Módulos
const users = require('../controllers/userController.js')
const rides = require('../models/rideModel.js')
const requestsList = require('./requestsController.js').requestsList

// Funciones
const callback = require('../lib/utils/utils').callbackReturn
const emailRules = require('../lib/utils/validation').emailRules
const emailMessage = require('../lib/utils/validation').emailMessage
const errorsMessage = require('../lib/utils/validation').rideMessage
const response = require('../lib/utils/response').response
const rideRules = require('../lib/utils/validation').rideRules
const validateIn = require('../lib/utils/validation').validateIn
const handleSockets = require('../lib/utils/handleSockets')

///////////////////////////////////////////////////////////////////////////////
/////////////////////////// Endpoint Crear una cola ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para crear una nueva cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function create (req, res) {
  const { status, errors, message } = await verifyDataRide(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const rideInf = await newRide(req.body)
  if (rideInf) {
    // for (let i = 0; i < requestsList[index].requests.length; i++) {
    //   const req = requestsList[index].requests[i]
    //   const email = req.email
    //   if (email === deleteRequest.user || email === deleteRequest.email) {
    //     requestsList[index].requests.splice(i, 1)
    //     if(removeList) {
    //       client.srem(requestsList[index].name, JSON.stringify(req))
    //       handleSockets.sendPassengers(requestsList[index].name)
    //     }
    //     return true
    //   }
    // }
    return res.status(200).send(response(true, rideInf, 'Cola creada'))
  } else {
    return res.status(500).send(response(true, rideInf, 'Cola no fue creada'))
  }
}

/**
 * @typedef Verification
 * @type {Object}
 * @property {boolean} status  - true si y solo si la verificación pasa
 * @property {string}  errors  - Mensaje del primer error detectado
 * @property {string}  message - Verdadero destino del usuario solicitante
 * @author Francisco Márquez <12-11163@usb.ve>
 */

/**
 * Función que verifica la validez de los datos de una solicitud para
 * modificar la base de datos de las colas.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {string} status
 * @returns {Verification}
 */
async function verifyDataRide (dataRide) {
  const validate = validateIn(dataRide, rideRules, errorsMessage)
  const arrayPas = Array.isArray(dataRide.passenger)
  var emptyPas = true
  var pass = true
  var validPass = true
  const valSeats = parseInt(dataRide.seats) >= dataRide.passenger.length
  const rider = await users.findByEmail(dataRide.rider).then(callback) != null
  if (dataRide.passenger.length > 0) {
    pass = !(dataRide.rider in dataRide.passenger)
    for (var i = 0; i < dataRide.passenger.length; i++) {
      if (await users.findByEmail(dataRide.passenger[i]) === null) {
        validPass = false
      }
    }
  } else {
    emptyPas = false
  }
  if (!(validate.pass && arrayPas && emptyPas && pass && validPass && valSeats && rider)) {
    var errors = ''
    var message = ''
    if (!validate.pass) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (!arrayPas) {
      errors = 'Los pasajeros no están en un arreglo'
      message = 'Los pasajeros deben estar en un arreglo'
    } else if (!emptyPas) {
      errors = 'Arreglo vacío de pasajeros'
      message = 'No puede haber una cola sin pasajeros'
    } else if (!pass) {
      errors = 'El conductor es un pasajero'
      message = 'El conductor no puede ser un pasajero'
    } else if (!validPass) {
      errors = 'Hay pasajeros no registrados en esta cola'
      message = 'Todo pasajero tiene que ser un usuario registrado'
    } else if (!valSeats) {
      errors = 'Hay más pasajeros que asientos disponibles'
      message = 'Debe haber a lo sumo tantos pasajeros como asientos haya'
    } else {
      errors = 'El conductor no está registrado'
      message = 'El conductor tiene que estar registrado'
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

/**
 * Función que agrega una cola a la base de datos.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {Object} dataRide - Datos de la cola a modificar
 * @returns {Object} Datos de la cola insertada en la base de datos
 */
async function newRide (dataRide) {
  const { rider, passenger, seats, startLocation, destination } = dataRide
  const ride = {
    rider: rider,
    passenger: passenger,
    available_seats: seats,
    status: 'En Espera',
    start_location: startLocation,
    destination: destination,
    time: new Date(),
    ride_finished: false,
    comments: []
  }
  return rides.create(ride).then(callback)
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// Endpoint Finalizar una cola /////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para marcar como finalizada una cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function endRide (req, res) {
  const { status, errors, message } = await verifyDataRide(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const query = { $set: { ride_finished: true, status: 'Finalizado' } }
  const rideInf = await updateRide(req.body, query)
  if (rideInf) {
    return res.status(200).send(response(true, rideInf, 'Cola finalizada'))
  } else {
    return res.status(500).send(response(false, '', 'Cola no existe'))
  }
}

/**
 * Función que modifica una cola de la base de datos. Regresa el elemento ya
 * modificado.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {Object} rideInf  - Datos de la cola a modificar
 * @param {Object} query - Campos a modificar con valores nuevos
 * @returns {Object} Datos de la cola modificada en la base de datos
 */
async function updateRide (rideInf, query) {
  const original = { returnOriginal: false }
  const data = {
    rider: rideInf.rider,
    passenger: rideInf.passenger,
    available_seats: rideInf.seats,
    start_location: rideInf.startLocation,
    destination: rideInf.destination
  }
  return rides.findOneAndUpdate(data, query, original).then(callback)
}

///////////////////////////////////////////////////////////////////////////////
///////////////////// Endpoint Cambiar estado de una cola /////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para cambiar el estado de una cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function changeStatus (req, res) {
  const { status, errors, message } = await verifyStatusRide(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const rideInf = await updateRide(req.body, { status: req.body.status })
  if (rideInf) {
    handleSockets.sendRideStatus(rideInf);
    return res.status(200).send(response(true, rideInf, 'Estado cambiado'))
  } else {
    const err = 'Cola no existe'
    const msg = 'La cola buscada no está registrada'
    return res.status(500).send(response(false, err, msg))
  }
}

/**
 * Función que verifica la validez del estado de una cola para cambiarlo.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} status
 * @returns {Verification}
 */
async function verifyStatusRide (statusRide) {
  const { status, errors, message } = await verifyDataRide(statusRide)
  if (!status) return { status: status, errors: errors, message: message }
  const rule = { status: 'required|string' }
  const mssg = { 'required.status': 'El estado de la solicitud es requerido' }
  const validate = validateIn(statusRide, rule, mssg)
  if (!validate.pass) {
    return {
      status: false,
      errors: validate.errors,
      message: 'El estado no tiene el formato válido'
    }
  } else if (statusRide.status === 'En Espera') {
    return { status: true, errors: '', message: '' }
  } else if (statusRide.status === 'En Camino') {
    return { status: true, errors: '', message: '' }
  } else if (statusRide.status === 'Accidentado') {
    return { status: true, err: '', message: '' }
  } else if (statusRide.status === 'Finalizado') {
    return { status: true, errors: '', message: '' }
  } else {
    return {
      status: false,
      errors: validate.errors,
      message: 'El estado no tiene el formato válido'
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
////////////////// Endpoint Insertar comentarios de una cola //////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para insertar comentarios de una cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function commentARide (req, res) {
  const { status, errors, message } = await verifyComments(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const rideInf = await comment(req.body)
  if (rideInf) {
    return res.status(200).send(response(true, rideInf, 'Comentario agregado'))
  } else {
    const err = 'Cola no existe'
    const msg = 'La cola buscada no está registrada'
    return res.status(500).send(response(false, err, msg))
  }
}

/**
 * Función que verifica la validez de los datos de una solicitud para
 * agregar comentarios a una cola ya finalizada.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {string} dataRide
 * @returns {Verification}
 */
async function verifyComments (dataRide) {
  const rules = {
    rider: 'required|email',
    user: 'required|email',
    startLocation: 'required|string',
    destination: 'required|string',
    like: 'required|string',
    comment: 'string'
  }
  const mssg = {
    'required.rider': 'El correo del conductor es necesario',
    'required.user': 'El correo del pasajero es necesario',
    'required.startLocation': 'El lugar de partida es necesario',
    'required.destination': 'El lugar de destino es necesario',
    'required.like': 'El like es necesario'
  }
  const validate = validateIn(dataRide, rules, mssg)
  const like = dataRide.like === 'Sí' || dataRide.like === 'No'
  const rider = await users.findByEmail(dataRide.rider).then((sucs, err) => {
    return !err && !!sucs
  })
  if (!(validate.pass && like && rider)) {
    var errors = ''
    var message = ''
    if (!validate.pass) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (!like) {
      errors = 'Parece que el like no es Sí ni No'
      message = 'El like debe ser Sí o No'
    } else {
      errors = 'Parece que el conductor no se encuentra registrado'
      message = 'El conductor debe ser un usuario registrado'
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

/**
 * Función que inserta un comentario en una cola ya finalizada.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {string} dataRide
 * @returns {Object}
 */
async function comment (dataRide) {
  const user = dataRide.user
  const like = dataRide.like === 'Sí'
  const comen = !dataRide.comment ? undefined : dataRide.comment
  const data = {
    rider: dataRide.rider,
    start_location: dataRide.startLocation,
    destination: dataRide.destination,
    status: 'Finalizado',
    ride_finished: true
  }
  const query = { user_email: user, like: like, dislike: !like, comment: comen }
  return rides.findOne(data).then((sucs, err) => {
    if (!err && sucs) {
      for (var i = 0; i < sucs.comments.length; i++) {
        if (sucs.comments[i].user_email === query.user_email) {
          return sucs
        }
      }
      sucs.comments.push(query)
      sucs.markModified('comments')
      sucs.save(sucs => { return sucs }).catch(error => console.log(error))
      return sucs
    } else {
      return err
    }
  })
}

///////////////////////////////////////////////////////////////////////////////
///////////////// Endpoint Obtener la información de una cola /////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para obtener información de una cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function getRide (req, res) {
  const { status, errors, message } = verifyGetRide(req.secret)
  if (!status) return res.status(400).send(response(false, errors, message))
  const rideInf = await findRide(req.secret.email)
  const statusCode = rideInf ? 200 : 206, data = rideInf || 'Cola no existe'
  const msg = rideInf ? '' : 'La cola buscada no está registrada'
  return res.status(statusCode).send(response(true, data, msg))
}

function verifyGetRide (request) {
  const validate = validateIn(request, emailRules, emailMessage)
  var errors = '', message = ''
  if (!validate.pass) {
    errors = validate.errors
    message = 'Los datos introducidos no cumplen con el formato requerido'
  }
  return { status: errors === '', errors: errors, message: message }
}

/**
 * Función que devuelve una cola de la base de datos.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {Object} dataRide - Datos de la cola a modificar
 * @returns {Object} Datos de la cola insertada en la base de datos
 */
async function findRide (email) {
  const ride = await rides.findOne({ rider: email, ride_finished: false })
  const pass = await rides.findOne({ passenger: email, ride_finished: false })
  return ride || pass
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////// Exportar Endpoints ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports.create = create
module.exports.endRide = endRide
module.exports.changeStatus = changeStatus
module.exports.commentARide = commentARide
module.exports.getRide = getRide
