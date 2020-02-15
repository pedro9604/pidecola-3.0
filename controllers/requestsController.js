// requestController
const validateIn = require('../lib/utils/validation').validateIn
const response   = require('../lib/utils/response').response

var requestsList = [
  { name: "Baruta", requests: [] },
  { name: "Coche", requests: [] },
  { name: "Chacaito", requests: [] },
  { name: "La Paz", requests: [] },
  { name: "Bellas Artes", requests: [] }
]

const fromNameToInt = (name) => {
  if (name === "Baruta") return 0
  else if (name === "Coche") return 1
  else if (name === "Chacaito") return 2
  else if (name === "La Paz") return 3
  else if (name === "Bellas Artes") return 4
  else return -1
}

const requestsRules = {
  user: "required|email",
  start_location: "required|string",
  destination: "required|string"
}

const deleteRules = requestsRules

const errorsMessage = {
  'required.user': "El usuario es necesario.",
  'required.start_location': "El lugar de partida es necesario.",
  'required.destination': "El lugar de destino es necesario."
}

const add = (newRequest) => {
  const fromUSB = newRequest.start_location === "USB"
  const toUSB   = newRequest.destination === "USB"
  try {
    if (fromUSB || toUSB) {
      if (fromUSB) {
        index = fromNameToInt(newRequest.destination)
      } else {
        index = fromNameToInt(newRequest.start_location)
      }
      requestsList[index].requests.push(newRequest)
      return true
    } else {
      return false
    }
  } catch(error) {
    return false
  }
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, requestsRules, errorsMessage)

  if (!validate.pass) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  } else if (add(req.body)) {
    return res.status(200).send(response(true, req.body, 'Solicitud exitosa.'))
  } else {
    return res.status(500).send(response(false, req.body, 'Solicitud errada.'))
  }
}

const remove = (deleteRequest) => {
  fromUSB = deleteRequest.start_location === "USB"
  if (fromUSB) {
    index = fromNameToInt(deleteRequest.destination)
  } else {
    index = fromNameToInt(deleteRequest.start_location)
  }
  try {
    for (i = 0; i < requestsList[index].requests.length; i++) {
      if(requestsList[index].requests[i].user === deleteRequest.user) {
        requestsList[index].requests.splice(i, 1)
        return true
      }
    }
    return false
  } catch(error) {
    return false
  }
}

exports.delete = (req, res) => {
  const validate = validateIn(req.body, deleteRules, errorsMessage)

  if (!validate.pass) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  } else if (remove(req.body)) {
    return res.status(200).send(response(true, req.body, 'Solicitud exitosa.'))
  } else {
    return res.status(500).send(response(false, req.body, 'Solicitud errada.'))
  }
}

module.exports.requestsList = requestsList