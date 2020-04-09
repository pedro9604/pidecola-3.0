const Validator = require('validatorjs')

exports.validateIn = (obj, rules, messages) => {
  const validation = new Validator(obj, rules, messages)
  if (validation.passes()) return { pass: true }
  return { pass: false, errors: [].concat.apply([], Object.values(validation.errors.all())) }
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * generar una cola en la base de datos. Será usado en rideController.
 * @name rideRules
 * @type {Object}
 * @property {string} rider - Campo rider de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} seats - Campo seats de la solicitud es obligatorio y debe
 * tener formato de entero
 * @property {string} startLocation - Campo startLocation de la solicitud es
 * obligatorio
 * @property {string} destination - Campo destination de la solicitud es
 * obligatorio
 * @constant
 * @private
 */
exports.rideRules = {
  rider: 'required|email',
  seats: 'required|integer',
  startLocation: 'required|string',
  destination: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las rideRules en una solicitud.
 * Será usado en rideController.
 * @name rideMessage
 * @type {Object}
 * @property {string} 'required.rider' - Caso: Omisión o error del rider
 * @property {string} 'required.seats' - Caso: Omisión o error del seats
 * @property {string} 'required.startLocation' - Caso: Omisión del startLocation
 * @property {string} 'required.destination' - Caso: Omisión del destination
 * @constant
 * @private
 */
exports.rideMessage = {
  'required.rider': 'El conductor es necesario.',
  'required.seats': 'El número de asientos disponibles es necesario.',
  'required.startLocation': 'El lugar de partida es necesario.',
  'required.destination': 'El lugar de destino es necesario.'
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * generar una nueva solicitud de cola o eliminar una ya existente. Será usado
 * en requestsController.
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
exports.requestsRules = {
  user: 'required|email',
  startLocation: 'required|string',
  destination: 'required|string',
  comment: 'string',
  im_going: 'string'
}

/**
 * Mensajes de error en caso de no se cumplan las requestsRules en una
 * solicitud. Será usado en requestsController.
 * @name requestsMessage
 * @type {Object}
 * @property {string} 'required.user' - Caso: Omisión o error del user
 * @property {string} 'required.startLocation' - Caso: Omisión del startLocation
 * @property {string} 'required.destination' - Caso: Omisión del destination
 * @constant
 * @private
 */
exports.requestsMessage = {
  'required.user': 'El usuario es necesario.',
  'required.startLocation': 'El lugar de partida es necesario.',
  'required.destination': 'El lugar de destino es necesario.'
}

