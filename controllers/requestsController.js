// requestController
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const usr = require('./userController.js')

const requestsList = [
  { name: 'Baruta', requests: [] },
  { name: 'Coche', requests: [] },
  { name: 'Chacaito', requests: [] },
  { name: 'La Paz', requests: [] },
  { name: 'Bellas Artes', requests: [] }
]

const fromNameToInt = (name) => {
  if (name === 'Baruta') return 0
  else if (name === 'Coche') return 1
  else if (name === 'Chacaito') return 2
  else if (name === 'La Paz') return 3
  else if (name === 'Bellas Artes') return 4
  else return -1
}

const requestsRules = {
  user: 'required|email',
  starLocation: 'required|string',
  destination: 'required|string',
  comment: 'string',
  im_going: 'string'
}

const deleteRules = requestsRules

const errorsMessage = {
  'required.user': 'El usuario es necesario.',
  'required.starLocation': 'El lugar de partida es necesario.',
  'required.destination': 'El lugar de destino es necesario.'
}

const add = (newRequest) => {
  const fromUSB = newRequest.starLocation === 'USB'
  const toUSB = newRequest.destination === 'USB'
  try {
    var req = {
      email: newRequest.user,
      user: {
        usbid: "",
        phone: "",
        fName: "",
        lName: "",
        major: "",
        prPic: ""
      },
      start_location: newRequest.start_location,
      destination: newRequest.destination,
      comment: newRequest.comment,
      im_going: newRequest.im_going,
      status: false
    }
    if (fromUSB || toUSB) {
      let index
      if (fromUSB) {
        index = fromNameToInt(newRequest.destination)
      } else {
        index = fromNameToInt(newRequest.starLocation)
      }
      usr.findByEmail(newRequest.user).then((sucs, err) => {
        if (!err) {
          req.user.usbid = sucs.email.slice(0, 8),
          req.user.phone = sucs.phone_number,
          req.user.fName = sucs.first_name,
          req.user.lName = sucs.last_name,
          req.user.major = sucs.major,
          req.user.prPic = sucs.profile_pic
        }
      })
      req.status = true
      requestsList[index].requests.push(req)
      return req
    } else {
      return newRequest
    }
  } catch (error) {
    newRequest.status = false
    return newRequest
  }
}

exports.create = (req, res) => {
  const reqsInf = {
    user: req.body.user,
    starLocation: req.body.starLocation,
    destination: req.body.destination,
    comment: req.body.comment,
    im_going: req.body.im_going
  }
  const validate = validateIn(reqsInf, requestsRules, errorsMessage)

  if (!validate.pass) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  }
  const insert = add(reqsInf)
  const inf = {
    user: insert.email,
    information: insert.user,
    start_location: insert.start_location,
    destination: insert.destination,
    comment: insert.comment,
    im_going: insert.im_going,
    status: insert.status
  }
  if (insert.status) {
    // console.log(inf.information.phone_number)
    return res.status(200).send(response(true, inf, 'Solicitud exitosa.'))
  } else {
    return res.status(500).send(response(false, inf, 'Solicitud errada.'))
  }
}

const remove = (deleteRequest) => {
  let index
  const fromUSB = deleteRequest.starLocation === 'USB'
  if (fromUSB) {
    index = fromNameToInt(deleteRequest.destination)
  } else {
    index = fromNameToInt(deleteRequest.starLocation)
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

exports.delete = (req, res) => {
  const reqsInf = {
    user: req.body.user,
    starLocation: req.body.starLocation,
    destination: req.body.destination,
    comment: req.body.comment,
    im_going: req.body.im_going
  }
  const validate = validateIn(reqsInf, deleteRules, errorsMessage)

  if (!validate.pass) {
    return res.status(400).send(
      response(false, validate.errors, 'Ha ocurrido un error en el proceso.')
    )
  } else if (remove(reqsInf)) {
    return res.status(200).send(response(true, reqsInf, 'Solicitud exitosa.'))
  } else {
    return res.status(500).send(response(false, reqsInf, 'Solicitud errada.'))
  }
}

module.exports.requestsList = requestsList
module.exports.cast = fromNameToInt
