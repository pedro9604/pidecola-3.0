const Validator = require('validatorjs')

exports.validateIn = (obj, rules, messages) => {
  const validation = new Validator(obj, rules, messages)
  if (validation.passes()) return { pass: true }
  return { pass: false, errors: [].concat.apply([], Object.values(validation.errors.all())) }
}

// USADOS EN userController

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
exports.registerRules = {
  email: 'required|email',
  password: 'required|string',
  phoneNumber: 'required|string'
}

/**
 * Mensajes de error en caso de no se cumplan las registerRules en una
 * solicitud.
 * @name registerMessage
 * @type {Object}
 * @property {string} 'required.email' - Caso: Omisión o error del email
 * @property {string} 'required.password' - Caso: Omisión del password
 * @property {string} 'required.phoneNumber' - Caso: Omisión del phoneNumber
 * @constant
 * @private
 */
exports.registerMessage = {
  'required.email': 'El correo electrónico de la USB es necesario',
  'required.password': 'La contraseña es necesaria',
  'required.phoneNumber': 'El teléfono celular es necesario'
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * actualizar el perfil de un usuario en la base de datos.
 * @name updateRules
 * @type {Object}
 * @property {string} email - Campo email de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} password - Campo password de la solicitud es obligatorio
 * @property {string} phoneNumber - Campo phoneNumber de la solicitud es
 * obligatorio
 * @constant
 * @private
 */
exports.updateRules = {
  'body.first_name': 'required|string',
  'body.last_name': 'required|string',
  'body.age': 'required|integer',
  'body.major': 'required|string',
  'secret.email': 'required|email'
}

/**
 * Mensajes de error en caso de no se cumplan las updateRules en una solicitud.
 * @name updateMessage
 * @type {Object}
 * @property {string} 'required.email'       - Caso: Omisión o error del email
 * @property {string} 'required.password'    - Caso: Omisión del password
 * @property {string} 'required.phoneNumber' - Caso: Omisión del phoneNumber
 * @constant
 * @private
 */
exports.updateMessage = {
  'required.body.first_name': 'El nombre es requerido',
  'required.body.last_name': 'El apellido es requerido',
  'required.body.age': 'La edad es requerida',
  'required.body.major': 'La carrera es requerida',
  'required.secret.email': 'El e-mail es necesario'
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * actualizar el perfil de un usuario en la base de datos.
 * @name updateRules
 * @type {Object}
 * @property {string} email - Campo email de la solicitud es obligatorio y debe
 * tener formato de e-mail
 * @property {string} password - Campo password de la solicitud es obligatorio
 * @property {string} phoneNumber - Campo phoneNumber de la solicitud es
 * obligatorio
 * @constant
 * @private
 */
exports.deleteRules = {
  'body.plate': 'required|string',
  'secret.email': 'required|email'
}

/**
 * Mensajes de error en caso de no se cumplan las updateRules en una solicitud.
 * @name deleteMessage
 * @type {Object}
 * @property {string} 'required.email'       - Caso: Omisión o error del email
 * @property {string} 'required.password'    - Caso: Omisión del password
 * @property {string} 'required.phoneNumber' - Caso: Omisión del phoneNumber
 * @constant
 * @private
 */
exports.deleteMessage = {
  'required.body.plate': 'La placa es necesaria',
  'required.secret.email': 'El Email es necesario'
}

/**
 * Reglas que tienen que cumplir las solicitudes enviadas desde Front-End para
 * registrar un vehiculo.
 * @name addVehicleRules
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
exports.addVehicleRules = {
  'body.plate': 'required|string',
  'body.brand': 'required|string',
  'body.model': 'required|string',
  'body.year': 'required|integer',
  'body.color': 'required|string',
  'body.vehicle_capacity': 'required|integer',
  'secret.email': 'required|email'
}

/**
 * Mensajes de error en caso de no se cumplan las addVehiclesRules en una
 * solicitud.
 * @name addVehicleMessage
 * @type {Object}
 * @property {string} 'required.plate' - Caso: Omisión o error de placa
 * @property {string} 'required.brand' - Caso: Omisión de la marca
 * @property {string} 'required.model' - Caso: Omisión del modelo
 * @property {string} 'required.year' - Caso: Omisión del año
 * @property {string} 'required.color' - Caso: Omisión del color
 * @property {string} 'required.vehicle_capacity' - Caso: Omisión de la
 * capacidad
 * @constant
 * @private
 */
exports.addVehicleMessage = {
  'required.plate': 'La placa de el vehiculo es necesaria',
  'required.brand': 'La marca del vehiculo es necesaria',
  'required.model': 'El modelo del vehiculo es  necesario',
  'required.year': 'El año del vehiculo es  necesario',
  'required.color': 'El color del vehiculo es  necesario',
  'required.vehicle_capacity': 'La capacidad del vehiculo es  necesaria',
  'required.secret.email': 'El email es necesario'
}

// USADOS en rideController

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

// USADOS en requestsController

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

