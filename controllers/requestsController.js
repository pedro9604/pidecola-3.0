/**
 * Este módulo contiene la lista global de solicitudes de cola y las funciones
 * que la manejan para solicitar una cola, cancelar una solicitud y para ser
 * usado por el módulo controllers/algorithmController en la recomendación de
 * solicitudes de cola a un usuario conductor del sistema PideCola.
 * @module requestsController
 * @author Francisco Márquez <12-11163@usb.ve>
 * @require módulo: controllers/userController
 * @require lib/utils/emails.sendEmail
 * @require lib/utils/codeTemplate.offerTemplate
 * @require lib/utils/codeTemplate.responseTemplate
 * @require lib/utils/response.response
 * @require lib/utils/utils.callbackMail
 * @require lib/utils/utils.callbackReturn
 * @require lib/utils/validation.requestsMessage
 * @require lib/utils/validation.requestsRules
 * @require lib/utils/validation.validateIn
 */

///////////////////////////////////////////////////////////////////////////////
//////////////////////// Módulos, funciones requeridas ////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Modulos
const logger = require('../lib/logger.js')
const users = require('./userController.js')

// Funciones
const callback = require('../lib/utils/utils').callbackReturn
const callbackMail = require('../lib/utils/utils').callbackMail
const emailRules = require('../lib/utils/validation').emailRules
const emailMessage = require('../lib/utils/validation').emailMessage
const errorsMessage = require('../lib/utils/validation').requestsMessage
const offerTemplate = require('../lib/utils/codeTemplate').offerTemplate
const requestsRules = require('../lib/utils/validation').requestsRules
const responseTemplate = require('../lib/utils/codeTemplate').responseTemplate
const response = require('../lib/utils/response').response
const sendEmail = require('../lib/utils/emails').sendEmail
const validateIn = require('../lib/utils/validation').validateIn
const handleSockets = require('../lib/utils/handleSockets')

///////////////////////////////////////////////////////////////////////////////
//////////////////////// Variable global: requestsList ////////////////////////
///////////////////////////////////////////////////////////////////////////////

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
 * @author Francisco Márquez <12-11163@usb.ve>
 */

/**
 * @typedef Stop
 * @type {Object}
 * @property {string} name - Nombre de la parada
 * @property {Request[]} requests - Lista de solicitudes de cola
 * @author Francisco Márquez <12-11163@usb.ve>
 */

/**
 * Lista global de paradas donde se almacenan ordenadas como una cola First In-
 * First Out, las solicitudes de cola por parada de destino o de origen. El
 * orden de las paradas obdece a la distancia de cada parada desde la USB.
 * @author Francisco Márquez <12-11163@usb.ve>
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

// setInterval(()=> console.log(requestsList), 5000)

const connectREDIS = require('../lib/connections').connectREDIS
const client = connectREDIS()
requestsList.forEach( (elem, index) => {
  client.smembers( elem.name, (err, list) => {
    if (err) return console.log(err)
    list.forEach( request => {
      requestsList[index].requests.push(JSON.parse(request))
    })
  })
})

/**
 * Función que dado el nombre de una parada devuelve lo que sería su índice
 * dentro de requestsList. Debe ir en este módulo para facilitar su edición.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @protected
 * @param {string} name
 * @returns {number} Índice válido, -1 si name === 'USB', -2 si no
 */
function fromNameToInt (name) {
  if (name === 'Baruta') return 0
  else if (name === 'Coche') return 1
  else if (name === 'Chacaito') return 2
  else if (name === 'La Paz') return 3
  else if (name === 'Bellas Artes') return 4
  else if (name === 'USB') return -1
  else return -2
}

/**
 * @typedef Elem
 * @type {Object}
 * @property {boolean} in   - Indica si el elemento existe en una Stop
 * @property {Request} elem - Solicitud existente en una Stop
 * @author Francisco Márquez <12-11163@usb.ve>
 */

///////////////////////////////////////////////////////////////////////////////
/////////////////////////// Endpoint Pedir una cola//// ///////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint que crea una solicitud de cola.
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
  const { status, errors, message } = verifyRequest(req.body)
  if (!status) {
    logger.log('error', message, {user: req.body.user, operation: 'create-request', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  const user = await users.findByEmail(req.body.user).then(callback)
  const request = {
    email: req.body.user,
    user: {
      usbid: user.email.split('@')[0],
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
  logger.log('info', 'Solicitud creada', {user: req.body.user, operation: 'create-request', status: 200})
  return res.status(200).send(response(true, insert, 'Solicitud exitosa'))
}

/**
 * Función que verifica la validez de los datos de una solicitud para
 * modificar la lista de solicitudes de cola.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} request
 * @returns {Verification}
 */
function verifyRequest (request, cancel = false) {
  const validate = validateIn(request, requestsRules, errorsMessage)
  const fromUSB = request.startLocation === 'USB'
  const toUSB = request.destination === 'USB'
  const start = fromNameToInt(request.startLocation) > -2
  const dest = fromNameToInt(request.destination) > -2
  const exists = alreadyRequested(request.user).in
  var errors = '', message = ''
  if (!cancel) {
    if (!(validate.pass && !exists && (fromUSB !== toUSB) && start && dest)) {
      if (!validate.pass) {
        errors = validate.errors
        message = 'Los datos introducidos no cumplen con el formato requerido'
      } else if (exists) {
        errors = 'Solicitud existente'
        message = 'No puedes solicitar más de una cola'
      } else if (fromUSB) {
        errors = 'Cola es desde la USB'
        message = 'No puede haber una cola desde la USB hasta la USB'
      } else if (!toUSB) {
        errors = 'Cola no involucra a la USB'
        message = 'No puede haber una cola que no salga de, o llegue a, la USB'
      } else if (!start) {
        errors = 'Cola no empieza en una parada autorizada'
        message = 'Ninguna cola puede involucrar una parada no autorizada'
      } else {
        errors = 'Cola no termina en una parada autorizada'
        message = 'Ninguna cola puede involucrar una parada no autorizada'
      }
    } else {
      return { status: true, errors: '', message: '' }
    }
  } else {
    if (!(validate.pass && exists && (fromUSB !== toUSB) && start && dest)) {
      if (!validate.pass) {
        errors = validate.errors
        message = 'Los datos introducidos no cumplen con el formato requerido'
      } else if (!exists) {
        errors = 'Solicitud inexistente'
        message = 'No tienes una cola que cancelar'
      } else if (fromUSB) {
        errors = 'Cola es desde la USB'
        message = 'No puede haber una cola desde la USB hasta la USB'
      } else if (!toUSB) {
        errors = 'Cola no involucra a la USB'
        message = 'No puede haber una cola que no salga de, o llegue a, la USB'
      } else if (!start) {
        errors = 'Cola no empieza en una parada autorizada'
        message = 'Ninguna cola puede involucrar una parada no autorizada'
      } else {
        errors = 'Cola no termina en una parada autorizada'
        message = 'Ninguna cola puede involucrar una parada no autorizada'
      }
    } else {
      return { status: true, errors: '', message: '' }
    }
  }
  return { status: false, errors: errors, message: message }
}

/**
 * Indica si el email se encuentra en la lista requestsList.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} email - Un email
 * @returns {Elem}
 */
function alreadyRequested (email) {
  for (var i = 0; i < requestsList.length; i++) {
    if (inList(email, requestsList[i].requests).in) {
      return inList(email, requestsList[i].requests)
    }
  }
  return { in: false, elem: {} }
}

/**
 * Indica si el email se encuentra en la lista list.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} email  - Un email
 * @param {Object[]} list - Una lista de solicitudes
 * @returns {Elem}
 */
function inList (email, list) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].email === email) return { in: true, elem: list[i] }
  }
  return { in: false, elem: {} }
}

/**
 * Función que agrega una solicitud de cola a su respectiva parada.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} newRequest
 * @returns {Object} Solicitud insertada o solicitud recibida si hay error
 */
function add (newRequest) {
  const fromUSB = newRequest.startLocation === 'USB'
  let index
  if (fromUSB) {
    index = fromNameToInt(newRequest.destination)
  } else {
    index = fromNameToInt(newRequest.startLocation)
  }
  requestsList[index].requests.push(newRequest)
  client.sadd(requestsList[index].name, JSON.stringify(newRequest))
  handleSockets.sendPassengers(requestsList[index].name)
  return newRequest
}

///////////////////////////////////////////////////////////////////////////////
/////////////////// Endpoint Cancelar una solicitud de cola ///////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para cancelar una solicitud de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
function cancel (req, res) {
  const { status, errors, message } = verifyRequest(req.body, true)
  if (!status) {
    logger.log('error', message, {user: req.body.email, operation: 'delete-request', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  var del = remove(req.body, true)
  if (del) {
    logger.log('info', 'Solicitud eliminada', {user: req.body.email, operation: 'delete-request', status: 200})
    return res.status(200).send(response(true, '', 'Solicitud exitosa'))
  } else {
    logger.log('error', 'La solicitud no existe', {user: req.body.email, operation: 'delete-request', status: 500})
    return res.status(200).send(response(false, '', 'Cola no existe'))
  }
}

/**
 * Función que elimina una solicitud de cola a su respectiva parada.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} deleteRequest
 * @returns {boolean} true si y solo si fue correctamente eliminada
 */
function remove (deleteRequest, removeList = false) {
  let index
  const fromUSB = deleteRequest.startLocation === 'USB'
  if (fromUSB) {
    index = fromNameToInt(deleteRequest.destination)
  } else {
    index = fromNameToInt(deleteRequest.startLocation)
  }
  if(!requestsList[index].requests) return false
  for (var i = 0; i < requestsList[index].requests.length; i++) {
    const req = requestsList[index].requests[i]
    const email = req.email
    if (email === deleteRequest.user || email === deleteRequest.email) {
      requestsList[index].requests.splice(i, 1)
      client.srem(requestsList[index].name, JSON.stringify(req))
      if (removeList) {
        handleSockets.sendPassengers(requestsList[index].name)
      }
      return true
    }
  }
  return false
}

///////////////////////////////////////////////////////////////////////////////
///////////// Endpoint Cambiar el estado de una solicitud de cola /////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para cambiar el estado de una solicitud de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
function updateStatus (req, res) {
  const { status, errors, message } = verifyStatus(req.body)
  if (!status) {
    logger.log('error', message, {user: req.body.user, operation: 'update-request', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  changeStatus(req.body.user, req.body.place)
  logger.log('info', 'Estado de solicitud actualizado', {user: req.body.user, operation: 'update-request', status: 200})
  return res.status(200).send(response(true, '', 'Cambiado exitosamente'))
}

/**
 * Función que verifica que los datos recibidos tengan el formato adecuado para
 * cambiar el estado de una solicitud de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} request
 * @param {string} request.user  - Un correo de usuario.
 * @param {string} request.place - Una parada del sistema PideCola
 * @returns {Verification}
 */
function verifyStatus (request) {
  const changeStatusRules = {
    user: 'required|email',
    place: 'required|string'
  }
  const errorMessage = {
    'required.user': 'El email del usuario es necesario',
    'required.place': 'El lugar, diferente de la USB, necesario'
  }
  const validate = validateIn(request, changeStatusRules, errorMessage)
  const index = fromNameToInt(request.place)
  if (!(validate.pass && request.place !== 'USB' && index > -1)) {
    var errors = ''
    var message = ''
    if (!validate.pass) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (request.place === 'USB') {
      errors = 'Lugar es la USB'
      message = 'Si vas a la USB, di el lugar de donde vienes. '
      message = message + 'Si vienes de la USB, di el lugar a donde vas'
    } else {
      errors = 'El lugar no es una parada autorizada'
      message = 'Debes indicar una parada autorizada'
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

/**
 * Procedimiento: Cambia el estado de una solicitud de cola, cuando esta existe
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} email - Un email
 * @param {string} place - Una parada
 */
function changeStatus (email, place) {
  const s = fromNameToInt(place)
  for (var i = 0; i < requestsList[s].requests.length; i++) {
    if (requestsList[s].requests[i].email === email) {
      requestsList[s].requests[i].status = !requestsList[s].requests[i].status
      break
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
////////////////////////// Endpoint Ofrecer una cola //////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para ofrecer la cola
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function offerRide (req, res) {
  const { status, errors, message } = await verifyOffer(req.body)
  if (!status) {
    logger.log('error', message, {user: req.body.rider, operation: 'offer-ride', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  sendOffer(req.body)
  const user = await users.findByEmail(req.body.rider).then(callback);
  const dataOffer = {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    age: user.age,
    major: user.major,
    phone_number: user.phone_number,
    profile_pic: user.profile_pic,
    car: user.vehicles.find(car => car.plate === req.body.car),
    route: req.body.route
  }
  client.set('OFFER-' + req.body.passenger + '-' + user.email, JSON.stringify(dataOffer))
  handleSockets.sendRideOffer(req.body.passenger, dataOffer);
  logger.log('info', 'Oferta enviada', {user: req.body.rider, operation: 'offer-ride', status: 200})
  return res.status(200).send(response(true, 'Ok', 'Oferta enviada'))
}

async function getDataRide(offer){
  return new Promise( async (resolved, reject) => {
    await client.get(offer, (err, data) => {
      resolved(JSON.parse(data))
    })
  })
}

async function reviewOffers(req, res){
  if(!req.body.email) return res.status(400).send(response(false, [], 'El correo electronico es necesario'))
  let offers = []
  client.keys('OFFER-*-' + req.body.email, async (err, list) => {
    if (err) return console.log(err)
    if (!list || !list.length) return res.status(403).send(response(false, [], 'No existen Ofertas.'))
    list.forEach( (offer, index) => {
      client.get(offer, (err, data) => {
        if(err) return
        offers.push({[offer] : JSON.parse(data) })
        if(index === list.length-1) return res.status(200).send(response(true, offers, 'Existen Ofertas.'))
      })
    })
  })
}

/**
 * Función que verifica que los datos recibidos tengan el formato adecuado para
 * ofrecer la cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} dataOffer
 * @param {string} dataOffer.rider     - El correo del ofertante
 * @param {string} dataOffer.passenger - El correo del solicitante
 * @returns {Verification}
 */
async function verifyOffer (dataOffer) {
  const offerRules = {
    rider: 'required|email',
    passenger: 'required|email',
    car: 'required|string',
    route: 'required|string'
  }
  const offerMessage = {
    'required.rider': 'El conductor es necesario',
    'required.passenger': 'El pasajero es necesario',
    'required.car': 'El vehículo es necesario',
    'required.route': 'La ruta es necesaria'
  }
  let errors
  let message
  const validate = validateIn(dataOffer, offerRules, offerMessage)
  const user = alreadyRequested(dataOffer.passenger).elem.status
  const rider = await users.findByEmail(dataOffer.rider).then(callback)
  const valCar = rider.vehicles.find(c => c.plate === dataOffer.car)
  if (!(validate.pass && user && rider.vehicles.length > 0 && valCar)) {
    if (!validate.pass) {
      errors = validate.errors
      message = 'Los datos introducidos no cumplen con el formato requerido'
    } else if (!user) {
      errors = 'Usuario no disponible para ofrecer cola'
      message = 'El usuario seleccionado ya tiene una oferta previa'
    } else if (rider.vehicles.length <= 0) {
      errors = 'Conductor no tiene vehículos'
      message = 'Para dar la cola tienes que registrar al menos un vehículo'
    } else {
      errors = 'Vehículo no es del conductor'
      message = 'Para dar la cola, el vehículo indicado debe estar registrado'
    }
    return { status: false, errors: errors, message: message }
  }
  return { status: true, errors: '', message: '' }
}

/**
 * @typedef SentStatus
 * @type {Object}
 * @property {boolean}       sent   - Estado del envío
 * @property {string}        log    - Información del servicio de email
 * @property {Object|string} errors - Errores experimentados
 * @author Francisco Márquez <12-11163@usb.ve>
 */

/**
 * Función que envía un correo electrónico notificando que hay una oferta de
 * cola para una solicitud.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {Object} offer
 * @param {string} offer.rider     - El correo del ofertante
 * @param {string} offer.passenger - El correo del solicitante
 * @returns {SentStatus}
 */
async function sendOffer (offer) {
  const subj = 'Nueva oferta de cola'
  const name = await users.findByEmail(offer.passenger).then(callback)
  const html = offerTemplate(name.first_name)
  try {
    return sendEmail(offer.passenger, subj, html).then(callbackMail)
  } catch (error) {
    console.log('ERROR SENDING EMAIL');
  }
}

///////////////////////////////////////////////////////////////////////////////
/////////////////// Endpoint Responder a una oferta de cola ///////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para responder una oferta de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
async function respondOfferRide (req, res) {
  const { status, errors, message } = verifyRespondOffer(req.body)
  if (!status) {
    logger.log('error', message, {user: req.body.rider, operation: 'respond-request', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  const answer = await respondOffer(req.body)
  if (answer.sent) {
    handleSockets.sendPassengerResponse({rider: req.body.rider, passenger: req.body.passenger, answer: req.body.accept})
    logger.log('info', 'Oferta respondida', {user: req.body.rider, operation: 'respond-request', status: 200})
    return res.status(200).send(response(true, answer.log, 'Respondiste'))
  } else {
    logger.log('error', 'Error en respuesta', {user: req.body.rider, operation: 'respond-request', status: 500})
    return res.status(500).send(response(false, answer.errors, 'Error'))
  }
}

/**
 * Función que verifica que los datos recibidos tengan el formato adecuado para
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} dataResponse
 * @param {string} dataResponse.rider     - El correo del ofertante
 * @param {string} dataResponse.passenger - El correo del solicitante
 * @param {string} dataResponse.accept    - String = 'Sí' || 'No'
 * @returns {Verification}
 */
function verifyRespondOffer (dataResponse) {
  const responseRules = {
    rider: 'required|email',
    passenger: 'required|email',
    accept: 'required|string'
  }
  const offerMessage = {
    'required.rider': 'El conductor es necesario',
    'required.passenger': 'El pasajero es necesario',
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

/**
 * Función que envía un correo electrónico notificando que la cola ha sido
 * aceptada y elimina la solicitud de la lista; o rechazada.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @async
 * @param {Object} response
 * @param {string} response.rider     - El correo del ofertante
 * @param {string} response.passenger - El correo del solicitante
 * @returns {SentStatus}
 */
async function respondOffer (response, removeList = false) {
  const subj = 'Han respondido a tu oferta de cola'
  const name = await users.findByEmail(response.rider).then(callback)
  const html = responseTemplate(name.first_name)
  if (response.accept === 'Sí') {
    if (remove(alreadyRequested(response.passenger).elem, removeList)) {
      client.keys('OFFER-' + response.passenger + '*', (err, list) => {
        if (err) return console.log(err)
        if (!list || !list.length) return
        list.forEach( offer => {
          client.del(offer)
        })
      })
      try {
        return sendEmail(response.rider, subj, html).then(callbackMail)       
      } catch (error) {
       console.log('ERROR SENDING EMAIL');
      }
    } else {
      const log = 'Parece que la solicitud de cola no existe'
      const errors = 'La solicitud de cola no fue encontrada'
      return { sent: false, log: log, errors: errors }
    }
  } else {
    client.del('OFFER-' + response.passenger + '-' + response.rider)
    try {
      return sendEmail(response.rider, subj, html).then(callbackMail) 
    } catch (error) {
      console.log('ERROR SENDING EMAIL');
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//////////// Endpoint Obtener información de una solicitud de cola ////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint para obtener información de una oferta de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @async
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
function getRequest (req, res) {
  const { status, errors, message } = verifyGet(req.secret)
  if (!status) {
    logger.log('error', message, {user: req.secret.email, operation: 'get-request', status: 400})
    return res.status(400).send(response(false, errors, message))
  }
  const elm = alreadyRequested(req.secret.email)
  const statusCode = elm.in ? 200 : 206, msg = elm.in ? '' : 'No existe'
  logger.log('info', msg, {user: req.secret.email, operation: 'get-request', status: statusCode})
  return res.status(statusCode).send(response(true, elm.elem, msg))
}

/**
 * Función que verifica que los datos recibidos tengan el formato adecuado para
 * cambiar el estado de una solicitud de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} request
 * @param {string} request.user  - Un correo de usuario.
 * @param {string} request.place - Una parada del sistema PideCola
 * @returns {Verification}
 */
function verifyGet (request) {
  const validate = validateIn(request, emailRules, emailMessage)
  var errors = '', message = ''
  if (!validate.pass) {
    errors = validate.errors
    message = 'Los datos introducidos no cumplen con el formato requerido'
  }
  return { status: errors === '', errors: errors, message: message }
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////// Exportar Endpoints ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports.requestsList = requestsList // Esto no es un endpoint
module.exports.cast = fromNameToInt // Esto no es un endpoint
module.exports.create = create
module.exports.cancel = cancel
module.exports.updateStatus = updateStatus
module.exports.offerRide = offerRide
module.exports.respondOfferRide = respondOfferRide
module.exports.getRequest = getRequest
module.exports.reviewOffers = reviewOffers
