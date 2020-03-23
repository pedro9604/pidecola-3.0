/**
 * Este módulo contiene la lista global de solicitudes de cola y las funciones
 * que la manejan para solicitar una cola, cancelar una solicitud y para ser
 * usado por el módulo controllers/algorithmController en la recomendación de
 * solicitudes de cola a un usuario conductor del sistema PideCola.
 * @module controllers/requestsController
 * @author Francisco Márquez <12-11163@gmail.com>
 * @require módulo: controllers/userController
 * @require lib/utils/validation.validateIn
 * @require lib/utils/response.response
 */
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const usr = require('./userController.js')

/**
 * @typedef Request
 * @type {Object}
 * @property {string}  email - E-mail del usuario del PideCola
 * @property {Objtect} user - Datos relevantes del usuario para la solicitud
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
 * @private
 * @param {string} name
 * @returns {number} Índice válido o -1 si no se recibe el nombre de una parada
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
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * generar una nueva solicitud de cola o eliminar una ya existente.
 * @name requestsRules
 * @type {Object}
 * @property {string} user - Campo user de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} startLocation - Campo startLocation de la solicitud es
 * obligatorio
 * @property {string} destination - Campo destination de la solicitud es
 * obligatorio
 * @property {string} comment - Campo comment de la solicitud no es obligatorio
 * @property {string} im_going - Campo im_going de la solicitud no es
 * obligatorio
 * @constant
 * @private
 */
const requestsRules = {
  user: 'required|email',
  startLocation: 'required|string',
  destination: 'required|string',
  comment: 'string',
  im_going: 'string'
}

/**
 * Mensajes de error en caso de no se cumplan las requestsRules en una
 * solicitud.
 * @name errorsMessage
 * @type {Object}
 * @property {string} 'required.user' - Caso: Omisión o error del user
 * @property {string} 'required.startLocation' - Caso: Omisión del startLocation
 * @property {string} 'required.destination' - Caso: Omisión del destination
 * @constant
 * @private
 */
const errorsMessage = {
  'required.user': 'El usuario es necesario.',
  'required.startLocation': 'El lugar de partida es necesario.',
  'required.destination': 'El lugar de destino es necesario.'
}

/**
 * Función que agrega una solicitud de cola a su respectiva parada.
 * @function
 * @private
 * @param {Object} newRequest
 * @returns {Object} Solicitud insertada o solicitud recibida si hay error
 */
const add = (newRequest) => {
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
 * @function
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object} 
 */
exports.create = async (req, res) => {
  const validate = validateIn(req.body, requestsRules, errorsMessage)
  const fromUSB  = req.body.startLocation === 'USB'
  const toUSB    = req.body.destination === 'USB'
  const startVal = fromNameToInt(req.body.startLocation) > -2
  const destVal  = fromNameToInt(req.body.destination) > -2
  const exists   = alreadyRequested(req.body.user)
  if (!(validate.pass && !exists && (fromUSB != toUSB) && startVal && destVal)) {
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
    } else if (!startVal) {
      errors = "Cola no empieza en una parada autorizada."
      message = "Ninguna cola puede involucrar una parada no autorizada"
    } else {
      errors = "Cola no termina en una parada autorizada."
      message = "Ninguna cola puede involucrar una parada no autorizada"
    }
    return res.status(400).send(response(false, errors, message))
  }
  const user = await usr.findByEmail(req.body.user)
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
 * @function
 * @private
 * @param {Object} deleteRequest
 * @returns {boolean} true si y solo si fue correctamente eliminada
 */
const remove = (deleteRequest) => {
  let index
  const fromUSB = deleteRequest.startLocation === 'USB'
  if (fromUSB) {
    index = fromNameToInt(deleteRequest.destination)
  } else {
    index = fromNameToInt(deleteRequest.startLocation)
  }
  try {
    for (let i = 0; i < requestsList[index].requests.length; i++) {
      if (requestsList[index].requests[i].user === deleteRequest.user) {
        requestsList[index].requests.splice(i, 1)
        return true
      }
    }
    return false
  } catch (error) {
    return false
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
exports.delete = (req, res) => {
  const validate = validateIn(req.body, requestsRules, errorsMessage)

  if (!validate.pass) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  }
  var del = remove(req.body)
  if (del) {
    return res.status(200).send(response(true, '', 'Solicitud exitosa.'))
  } else {
    return res.status(500).send(response(false, '', 'Solicitud errada.'))
  }
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
    if (list[i].email === email) return true
  }
  return false
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
    if (inList(email, requestsList[i].requests)) return true
  }
  return false
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
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * cambiar el status de una solicitud de cola ya existente.
 * @name changeStatusRules
 * @type {Object}
 * @property {string} user - Campo user de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} place - Campo place de la solicitud es obligatorio
 * @constant
 * @private
 */
const changeStatusRules = {
  user: 'required|email',
  place: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las changeStatusRules en una
 * solicitud.
 * @name errorMessage
 * @type {Object}
 * @property {string} 'required.user'  - Caso: Omisión o error del user
 * @property {string} 'required.place' - Caso: Omisión del place
 * @constant
 * @private
 */
const errorMessage = {
  'required.user': "El email del usuario es necesario.",
  'required.place': "El lugar, diferente de la USB, necesario."
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
exports.changeStatus = (req, res) => {
  const validate = validateIn(req.body, changeStatusRules, errorMessage)
  const index = fromNameToInt(req.body.place)
  if (!(validate.pass && req.body.place != "USB" && index > -1)) {
    var errors = ""
    var message = ""
    if (!validate.pass) {
      errors = validate.errors
      message = "Los datos introducidos no cumplen con el formato requerido"
    } else if (req.body.place === "USB") {
      errors = "Lugar es la USB"
      message = ["Si vas a la USB, di el lugar de donde vienes"]
      message.push("Si vienes de la USB, di el lugar a donde vas")
    } else {
      errors = "El lugar no es una parada autorizada"
      message = "Debes indicar una parada autorizada"
    }
    return res.status(400).send(response(false, errors, message))
  }
  changeStatus(req.body.user, req.body.place)
  return res.status(200).send(response(false, '', "Cambiado exitosamente"))
}

module.exports.requestsList = requestsList
module.exports.cast = fromNameToInt
