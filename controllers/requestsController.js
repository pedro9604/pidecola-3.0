/**
 * Este módulo contiene la lista global de solicitudes de cola y las funciones
 * que la manejan para solicitar una cola, cancelar una solicitud y para ser
 * usado por el módulo controllers/algorithmController en la recomendación de
 * solicitudes de cola a un usuario conductor del sistema PideCola.
 * @module controllers/requestsController
 * @author Francisco Márquez <12-11163@gmail.com>
 * @require módulo: controllers/userController
 * @require lib/utils/validation.validateIn
 * @require lib/utils/validation.requestsRules
 * @require lib/utils/validation.requestsMessage
 * @require lib/utils/response.response
 */
const validateIn = require('../lib/utils/validation').validateIn
const requestsRules = require('../lib/utils/validation').requestsRules
const errorsMessage = require('../lib/utils/validation').requestsMessage
const response = require('../lib/utils/response').response
const callback = require('../lib/utils/utils').callbackReturn
const callbackMail = require('../lib/utils/utils').callbackMail
const offerTemplate = require('../lib/utils/codeTemplate').offerTemplate
const responseTemplate = require('../lib/utils/codeTemplate').responseTemplate
const sendEmail = require('../lib/utils/emails').sendEmail
const usr = require('./userController.js')

/**
 * @typedef Request
 * @type {Object}
 * @property {string}  email - E-mail del usuario del PideCola
 * @property {Object}  user - Datos relevantes del usuario para la solicitud
 * @property {string}  user.usbid - USB-ID del usuario solicitante
 * @property {string}  user.phone - Número de teléfono del usuario solicitante
 * @property {string}  user.fName - Nombre del usuario solicitante
 * @property {string}  user.lName - Apellido del usuario solicitante
 * @property {string}  user.major - Carrera del usuario solicitante
 * @property {string}  user.prPic - URL foto de perfil del usuario solicitante
 * @property {string}  startLocation - Ubicación del usuario solicitante
 * @property {string}  destination - Destino del usuario solicitante
 * @property {string}  comment - Observación del usuario solicitante
 * @property {string}  im_going - Verdadero destino del usuario solicitante
 * @property {boolean} status - Estado de la solicitud
 */

/**
 * @typedef Stop
 * @type {Object}
 * @property {string} name - Nombre de la parada
 * @property {Request[]} requests - Lista de solicitudes de cola
 */

/**
 * Lista global de paradas donde se almacenan ordenadas como una cola First In-
 * First Out, las solicitudes de cola por parada de destino o de origen. El
 * orden de las paradas obdece a la distancia de cada parada desde la USB.
 * @name stops
 * @type {Stop[]}
 * @constant
 * @public
 */
const requestsList = [
  { name: 'Baruta', requests: [] },
  { name: 'Coche', requests: [] },
  { name: 'Chacaito', requests: [] },
  { name: 'La Paz', requests: [] },
  { name: 'Bellas Artes', requests: [] }
]

/**
 * Función que dado el nombre de una parada devuelve lo que sería su índice
 * dentro de requestsList.
 * @function
 * @public
 * @param {string} name
 * @returns {number} Índice válido, -1 si name === "USB", -2 si no
 */
const fromNameToInt = (name) => {
  if (name === 'Baruta') return 0
  else if (name === 'Coche') return 1
  else if (name === 'Chacaito') return 2
  else if (name === 'La Paz') return 3
  else if (name === 'Bellas Artes') return 4
  else if (name === 'USB') return -1
  else return -2
}

/**
 * Indica si el email se encuentra en la lista list.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @private
 * @param {string} email  - Un email
 * @param {Object[]} list - Una lista de solicitudes
 * @returns {boolean}
 */
function inList(email, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].email === email) return { in: true, elem: list[i] }
  }
  return { in: false, elem: {} }
}

/**
 * Indica si el email se encuentra en la lista requestsList.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @private
 * @param {string} email - Un email
 * @returns {boolean}
 */
function alreadyRequested(email) {
  for (var i = 0; i < requestsList.length; i++) {
    if (inList(email, requestsList[i].requests).in) {
      return inList(email, requestsList[i].requests)
    }
  }
  return { in: false, elem: {} }
}

/**
 * Función que verifica la validez de los datos de una solicitud para
 * modificar la lista de solicitudes de cola.
 * @private
 * @param {string} request
 * @returns {Verification}
 */
function verifyRequest(request) {
  const validate = validateIn(request, requestsRules, errorsMessage)
  const fromUSB  = request.startLocation === 'USB'
  const toUSB    = request.destination === 'USB'
  const start    = fromNameToInt(request.startLocation) > -2
  const dest     = fromNameToInt(request.destination) > -2
  const exists   = alreadyRequested(request.user).in
  if (!(validate.pass && !exists && (fromUSB != toUSB) && start && dest)) {
    var errors = ""
    var message = ""
    if (!validate.pass) {
      errors = validate.errors
      message = "Los datos introducidos no cumplen con el formato requerido"
    } else if (exists) {
      errors = "Solicitud existente"
      message = "No puedes solicitar más de una cola"
    } else if (fromUSB) {
      errors = "Cola es desde la USB"
      message = "No puede haber una cola desde la USB hasta la USB"
    } else if (!toUSB) {
      errors = "Cola no involucra a la USB"
      message = "No puede haber una cola que no salga de, o llegue a, la USB"
    } else if (!start) {
      errors = "Cola no empieza en una parada autorizada."
      message = "Ninguna cola puede involucrar una parada no autorizada"
    } else {
      errors = "Cola no termina en una parada autorizada."
      message = "Ninguna cola puede involucrar una parada no autorizada"
    }
    return { valid: false, errors: errors, message: message }
  }
  return { valid: true, errors: '', message: '' }
}

/**
 * Función que agrega una solicitud de cola a su respectiva parada.
 * @private
 * @param {Object} newRequest
 * @returns {Object} Solicitud insertada o solicitud recibida si hay error
 */
function add(newRequest) {
  const fromUSB = newRequest.startLocation === 'USB'
  const toUSB   = newRequest.destination === 'USB'
  let index
  if (fromUSB) {
    index = fromNameToInt(newRequest.destination)
  } else {
    index = fromNameToInt(newRequest.startLocation)
  }
  requestsList[index].requests.push(newRequest)
  return newRequest
}

/**
 * Endpoint para conexión con Front-end.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
async function create(req, res) {
  const { status, errors, message } = verifyRequest(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const user = await usr.findByEmail(req.body.user).then(callback)
  const request = {
    email: req.body.user,
    user: {
      usbid: user.email.slice(0, 8),
      phone: user.phone_number,
      fName: user.first_name,
      lName: user.last_name,
      major: user.major,
      prPic: user.profile_pic
    },
    startLocation: req.body.startLocation,
    destination: req.body.destination,
    comment: req.body.comment,
    im_going: req.body.im_going,
    status: true
  }
  const insert = add(request)
  return res.status(200).send(response(true, insert, 'Solicitud exitosa.'))
}

/**
 * Función que elimina una solicitud de cola a su respectiva parada.
 * @private
 * @param {Object} deleteRequest
 * @returns {boolean} true si y solo si fue correctamente eliminada
 */
function remove(deleteRequest) {
  let index
  const fromUSB = deleteRequest.startLocation === 'USB'
  if (fromUSB) {
    index = fromNameToInt(deleteRequest.destination)
  } else {
    index = fromNameToInt(deleteRequest.startLocation)
  }
  for (let i = 0; i < requestsList[index].requests.length; i++) {
    if (requestsList[index].requests[i].user === deleteRequest.user) {
      requestsList[index].requests.splice(i, 1)
      return true
    }
  }
  return false
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
function cancel(req, res) {
  const { status, errors, message } = verifyRequest(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))

  var del = remove(req.body)

  if (del) {
    return res.status(200).send(response(true, '', 'Solicitud exitosa.'))
  } else {
    return res.status(200).send(response(false, '', 'Cola no existe.'))
  }
}

/**
 * Verifica que los datos recibidos tengan el formato adecuado. No debería
 * modificarse a no ser que se cambie toda lógica detrás del algoritmo de
 * recomendación.
 * @private
 * @param {Object} request 
 * @param {string} request.user  - Un correo de usuario.
 * @param {string} request.place - Una parada del sistema PideCola
 * @returns {Verification}
 */
function verifyStatus(request) {
  const changeStatusRules = {user: 'required|email', place: 'required|string'}
  const errorMessage = {
    'required.user': "El email del usuario es necesario.",
    'required.place': "El lugar, diferente de la USB, necesario."
  }
  const validate = validateIn(request, changeStatusRules, errorMessage)
  const index = fromNameToInt(request.place)
  if (!(validate.pass && request.place != "USB" && index > -1)) {
    var errors = ""
    var message = ""
    if (!validate.pass) {
      errors = validate.errors
      message = "Los datos introducidos no cumplen con el formato requerido"
    } else if (req.body.place === "USB") {
      errors = "Lugar es la USB"
      message = "Si vas a la USB, di el lugar de donde vienes. "
      message = message + "Si vienes de la USB, di el lugar a donde vas"
    } else {
      errors = "El lugar no es una parada autorizada"
      message = "Debes indicar una parada autorizada"
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

/**
 * Procedimiento: Cambia el estado de una solicitud de cola, cuando esta existe
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @private
 * @param {string} email - Un email
 * @param {string} place - Una parada
 */
function changeStatus(email, place) {
  const s = fromNameToInt(place)
  for (var i = 0; i < requestsList[s].requests.length; i++) {
    if (requestsList[stop].requests[i].email === email) {
      requestsList[s].requests[i].status = !requestsList[s].requests[i].status
      break
    }
  }
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
function updateStatus(req, res) {
  const { status, errors, message } = verifyStatus(req.body)
  if (!status) {
    return res.status(400).send(response(false, errors, message))
  }
  changeStatus(req.body.user, req.body.place)
  return res.status(200).send(response(true, '', "Cambiado exitosamente"))
}

/**Funcion para ofrecer la cola*/
async function offerRide(req, res) {
  const { status, errors, message } = verifyOffer(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const offer = await sendOffer(req.body)
  if (offer.sent) {
    return res.status(200).send(response(true, offer.log, 'Oferta enviada'))
  } else {
    return res.status(500).send(response(false, offer.errors, 'Error'))
  }
}

function verifyOffer(dataOffer) {
  const offerRules = { rider: 'required|email', passenger: 'required|email' }
  const offerMessage = {
    'required.rider': 'El conductor es necesario',
    'required.passenger': 'El pasajero es necesario'
  }
  let errors
  let message
  const validate = validateIn(dataOffer, offerRules, offerMessage)
  if (!validate.pass) {
    errors = validate.errors
    message = 'Los datos introducidos no cumplen con el formato requerido'
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

async function sendOffer(offer) {
  const request = alreadyRequested(offer.passenger).in
  const fromUSB = request.startLocation === 'USB'
  const place = fromUSB ? request.destination : request.startLocation
  changeStatus(offer.passenger, place)
  const subj = 'Nueva oferta de cola'
  const name = await users.findByEmail(offer.passenger).then(callback)
  const html = offerTemplate(name.first_name)
  return sendEmail(offer.passenger, subj, html).then(callbackMail)
}

/**Funcion para aceptar/declinar una oferta*/
async function respondOfferRide(req, res) {
  const { status, errors, message } = verifyRespondOffer(req.body)
  if (!status) return res.status(400).send(response(false, errors, message))
  const answer = await respondOffer(req.body)
  if (answer.sent) {
    return res.status(200).send(response(true, answer.log, 'Respondiste'))
  } else {
    return res.status(500).send(response(false, answer.errors, 'Error'))
  }
}

function verifyRespondOffer(dataResponse) {
  const responseRules = {
    rider: 'required|email',
    passenger: 'required|email',
    accept: 'required|string'
  }
  const offerMessage = {
    'required.rider': 'El conductor es necesario',
    'required.passenger': 'El pasajero es necesario'
    'required.accept': 'La respuesta del solicitante es necesaria'
  }
  let errors
  let message
  const validate = validateIn(dataResponse, responseRules, offerMessage)
  const yesOrNot = dataResponse.accept === 'Sí' || dataResponse.accept === 'No'
  if (!(validate.pass && yesOrNot)) {
    if (!validate) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else {
      errors = 'La respuesta no parece ser Sí o No'
      message = 'La respuesta tiene que ser Sí o No'
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

async function respondOffer(response) {
  if (response.accept === 'Sí') {
    if (remove(alreadyRequested(response.passenger).elem)) {
      const subj = 'Han respondido a tu oferta de cola'
      const name = await users.findByEmail(response.rider).then(callback)
      const html = responseTemplate(name.first_name)
      return sendEmail(offer.rider, subj, html).then(callbackMail)
    } else {
      const log = 'Parece que la solicitud de cola no existe'
      const errors = 'La solicitud de cola no fue encontrada'
      return { sent: false, log: log, errors: errors }
    }
  } else {
    const request = alreadyRequested(response.passenger).in
    const fromUSB = request.startLocation === 'USB'
    const place = fromUSB ? request.destination : request.startLocation
    changeStatus(response.passenger, place)
    const subj = 'Han respondido a tu oferta de cola'
    const name = await users.findByEmail(response.rider).then(callback)
    const html = responseTemplate(name.first_name)
    return sendEmail(offer.rider, subj, html).then(callbackMail)
  }
}

module.exports.requestsList     = requestsList
module.exports.cast             = fromNameToInt
module.exports.create           = create
module.exports.cancel           = cancel
module.exports.updateStatus     = updateStatus
module.exports.offerRide        = offerRide
module.exports.respondOfferRide = respondOfferRide