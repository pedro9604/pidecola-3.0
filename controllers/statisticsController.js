const callbackCount = require('../lib/utils/utils').callbackCount
const emailRules = require('../lib/utils/validation').emailRules
const emailMessage = require('../lib/utils/validation').emailMessage
const rides = require('../models/rideModel.js')
const response = require('../lib/utils/response').response
const validateIn = require('../lib/utils/validation').validateIn

// Endpoint que cuenta los documentos donde el conductor (rider) tiene el correo del usuario
// Utiliza la funcion countDocuments de Mongoose
// Caso borde: El carnet no esta asociado a ningun conductor -> La consulta devuelve 0
async function getRidesGiven (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  if (!validate.pass) {
    const message = 'Los datos no cumplen con el formato requerido'
    return res.status(401).send(response(false, validate.errors, message))
  }
  
  const { status, data, message } = await rides.countDocuments({ 
    rider: req.secret.email 
  }).then(callbackCount)

  return res.status(status).send(response(status === 200, data, message))
}

// Endpoint que cuenta los documentos donde aparece el correo del usuario en la lista de pasajeros. 
// Utiliza la funcion countDocuments de Mongoose
// Caso borde: El carnet no pertenece a ninguna lista de pasajeros -> La consulta devuelve 0
async function getRidesReceived (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  if (!validate.pass) {
    const message = 'Los datos no cumplen con el formato requerido'
    return res.status(401).send(response(false, validate.errors, message))
  }
  
  const { status, data, message } = await rides.countDocuments({
    passenger: req.secret.email 
  }).then(callbackCount)

  return res.status(status).send(response(status === 200, data, message))
}

// Endpoint que cuenta los documentos donde el usuario ha sido conductor de la cola y suma el numero total de likes
// Utiliza la funcion aggregate de Mongoose donde $match recibe el filtro de la consulta
// $unwind Convierte el arreglo seleccionado (comments) en documentos unicos para ser contados
// $group Agrupa los documentos por id (o revisa todos si se coloca null)
// $sum acummulador
// Caso borde: El usuario no aparece como conductor -> La consulta devuelve 0
// Caso borde: El conductor no ha recibido likes -> La consulta devuelve 0
async function getLikesCount (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  if (!validate.pass) {
    const message = 'Los datos no cumplen con el formato requerido'
    return res.status(401).send(response(false, validate.errors, message))
  }
  
  const { status, data, message } = await rides.aggregate([
    { $match: { rider: req.secret.email } },
    { $unwind: '$comments' },
    { $match: {'comments.like': true } },
    { $group: { _id: null, likes_count: { $sum: 1 } } }
  ]).then(callbackCount)


  return res.status(status).send(response(status === 200, data, message))
}

// Endpoint que cuenta los documentos donde el usuario ha sido conductor de la cola y suma el numero total de dislikes
// Utiliza la funcion aggregate de Mongoose donde $match recibe el filtro de la consulta
// $unwind Convierte el arreglo seleccionado (comments) en documentos unicos para ser contados
// $group Agrupa los documentos por id (o revisa todos si se coloca null)
// $sum acummulador
// Caso borde: El usuario no aparece como conductor -> La consulta devuelve 0
// Caso borde: El conductor no ha recibido dislikes -> La consulta devuelve 0
async function getDislikesCount (req, res) {
  const validate = validateIn(req.secret, emailRules, emailMessage)
  if (!validate.pass) {
    const message = 'Los datos no cumplen con el formato requerido'
    return res.status(401).send(response(false, validate.errors, message))
  }
  
  const { status, data, message } = await rides.aggregate([
    { $match: { rider: req.secret.email } },
    { $unwind: '$comments' },
    { $match: {'comments.dislike': true } },
    { $group: { _id: null, dislikes_count: { $sum: 1 } } }
  ]).then(callbackCount)

  return res.status(status).send(response(status === 200, data, message))
}

module.exports.getRidesGiven = getRidesGiven
module.exports.getRidesReceived = getRidesReceived
module.exports.getLikesCount = getLikesCount
module.exports.getDislikesCount = getDislikesCount