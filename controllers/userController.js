const bcrypt = require('bcryptjs')
const validateIn = require('../lib/utils/validation').validateIn
const response = require('../lib/utils/response').response
const users = require('../models/userModel.js')
const upload = require('../lib/cloudinaryConfig.js').upload
const cloudinary = require('cloudinary')

const BCRYPT_SALT_ROUNDS = 12

const registerRules = {
  email: 'required|email',
  password: 'required|string',
  phoneNumber: 'required|string'
}

const errorsMessage = {
  'required.email': "El correo electrónico de la usb es necesario.",
  'required.password': "La contraseña es necesaria.",
  'required.phoneNumber': "El teléfono celular es necesario."
}

const create = (dataUser) => {
  const { email, password, phoneNumber } = dataUser
  return users.create({
    email: email,
    password: password,
    phone_number: phoneNumber
  })
}

exports.findByEmail = (email) => {
  return users.findOne({ email: email })
}

exports.getPic = (email) => {
  return users.findOne({ email: email }).select('profile_pic')
}

exports.create = (req, res) => {
  const validate = validateIn(req.body, registerRules, errorsMessage)

  if (!validate.pass) return res.status(400).send(response(false, validate.errors, 'Ha ocurrido un error en el proceso'))

  bcrypt.hash(req.body.password, BCRYPT_SALT_ROUNDS)
    .then(hashedPassword => {
      req.body.password = hashedPassword
      return create(req.body)
    })
    .then(usr => {
      const userInf = { email: usr.email, phoneNumber: usr.phone_number }
      return res.status(200).send(response(true, userInf, 'Usuario creado.'))
    })
    .catch(err => {
      let mssg = 'Usuario no ha sido creado.'
      if (err && err.code && err.code === 11000) mssg = 'Ya existe usuario.'
      return res.status(500).send(response(false, err, mssg))
    })
}





exports.addVehicle = (upload, (req, res) => {

  cloudinary.v2.uploader.upload(req.file, function(picture) {
    
    users.find({"vehicles.plate": req.body.plate}, function(error, result){

      
      if (error)
        return res.status(500).send(response(false, error, 'Fallo en la busqueda'))

      else if (!result.length)
        
        users.findOneAndUpdate({email: req.body.email}, 

          {$push: {
            vehicles: {
              "plate": req.body.plate,
              "model": req.body.model,
              "year": req.body.year,
              "color": req.body.color,
              "vehicle_capacity": req.body.vehicle_capacity,
              "vehicle_pic": picture.secure_url
              } 
            }
      
          },
      
          {new: true},
          
          function(error, doc){
            if (error){
              return res.status(500).send(response(false, error, 'Vehiculo no fue agregado'))
            }
            else
              return res.status(200).send(response(true, doc, 'Vehiculo agregado.'))
          })
      else    
        return res.status(500).send(response(false, error, 'Vehiculo ya existe'))

    })
  })
})    