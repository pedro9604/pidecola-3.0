const callback   = require('../lib/utils/utils').callbackReturn
const httpMocks  = require('node-mocks-http')
const user       = require('../controllers/userController.js')
const userDB     = require('../models/userModel.js')

describe('create', () => {
  test('A new user is created', () => {
    const data = {
      email: '00-00000@usb.ve',
      password: 'password',
      phoneNumber: 'phoneNumber'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('An existed user is not created', () => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password',
      phone_number: 'phoneNumber',
      isVerify: true
    }).then(callback)
    const data = {
      email: '00-00000@usb.ve',
      password: 'password',
      phoneNumber: 'phoneNumber'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(403)
    })
  })

  test('A request without email fails', () => {
    const data = {
      email: '00-00000',
      password: 'password',
      phoneNumber: 'phoneNumber'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A request without password fails', () => {
    const data = {
      email: '00-00000@usb.ve',
      password: '',
      phoneNumber: 'phoneNumber'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A request without phone number fails', () => {
    const data = {
      email: '00-00000@usb.ve',
      password: 'password',
      phoneNumber: ''
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })
})

describe('codeValidate', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      temporalCode: 123456789
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1',
      isVerify: true,
      temporalCode: 0
    }).then(callback)
  })

  afterEach(() => { userDB.deleteOne({ email: '00-00000@usb.ve' }, callback) })

  test('A new user is verified', () => {
    const request = httpMocks.createRequest({
      body: { code: '123456789', email: '00-00000' }
    })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('A request without code', () => {
    const request  = httpMocks.createRequest({ body: { email: '00-00000' } })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(403)
    })
  })

  test('A request without email', () => {
    const request  = httpMocks.createRequest({ body: { code: '0' } })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(401)
    })
  })

  test('User is not pending for validating', () => {
    const request  = httpMocks.createRequest({
      body: { code: '0', email: '00-00001@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(401)
    })
  })

  test('User had been already validated', () => {
    const request  = httpMocks.createRequest({
      body: { code: '0', email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(401)
    })
  })

  test('User is not pending for validating', () => {
    const request  = httpMocks.createRequest({
      body: { code: '987654321', email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.codeValidate(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(401)
    })
  })
})

describe('getUserInformation', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password',
      phone_number: 'phoneNumber',
      first_name: 'Usuario',
      last_name: '0',
      age: 0,
      gender: 'O',
      major: 'Ing. de Computación',
      profile_pic: 'Foto0',
      status: 'Disponible',
      community: 'Estudiante',
      vehicles: [{
        plate: 'placa',
        brand: 'marca',
        model: 'modelo',
        year: 0,
        color: 'black',
        vehicle_capacity: 1,
        vehicle_pic: 'FotoCarro'
      }],
      isVerify: true,
      temporalCode: 0
    }).then(callback)
  })

  afterEach(() => { userDB.deleteOne({ email: '00-00000@usb.ve' }, callback) })

  test('User can get his profile info', () => {
    const request  = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.getUserInformation(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Request without e-mail', () => {
    const request  = httpMocks.createRequest({ secret: { email: '' } })
    const response = httpMocks.createResponse()
    user.getUserInformation(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Email does not have e-mail format', () => {
    const request  = httpMocks.createRequest({ secret: { email: '00-00000' } })
    const response = httpMocks.createResponse()
    user.getUserInformation(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('User not registered cannot get any profile info', () => {
  //   const request  = httpMocks.createRequest({
  //     secret: { email: '00-00001@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.getUserInformation(request, response)
  //   expect(response.statusCode).toBe(500)
  // })
})

// Falta resolver 8 casos
describe('updateUser', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      isVerify: true,
      temporalCode: 0
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1',
      isVerify: false,
      temporalCode: 123456789
    }).then(callback)
    userDB.create({
      first_name: 'Usuario',
      last_name: '2',
      email: '22-22222@usb.ve',
      password: 'password2',
      phone_number: 'phoneNumber2',
      isVerify: true,
      temporalCode: 0
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('User updates his profile info', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(200)
  })

  // test('User cannot change its first name', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     age: '2',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '22-22222@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  // test('User cannot change its last name', () => {
  //   const data = {
  //     last_name: '2',
  //     age: '2',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '22-22222@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  test('Email does not have an e-mail format', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('User is not registered', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '0',
  //     age: '0',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '00-00001@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  // test('User is not verified', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '1',
  //     age: '1',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '11-11111@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  test('Request without email', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without first name', () => {
    const data = {
      first_name: '',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without last name', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without age', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Age is not an integer', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: 'a',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without gender', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: '',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(200)
  })

  // test('Gender is not valid', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '0',
  //     age: '',
  //     gender: 'LGBTII...',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '00-00000@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  test('Request without phone', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: '',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Request without major', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: '',
      status: 'Disponible',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('Major is not valid', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '0',
  //     age: '0',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Lic. en Computación',
  //     status: 'Disponible',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '00-00000@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  test('Request without status', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: '',
      community: 'Estudiante'
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(200)
  })

  // test('Status is not valid', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '0',
  //     age: '0',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Available',
  //     community: 'Estudiante'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '00-00000@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  test('Request without community', () => {
    const data = {
      first_name: 'Usuario',
      last_name: '0',
      age: '0',
      gender: 'O',
      phone_number: 'newPhoneNumber',
      major: 'Ing. de Computación',
      status: 'Disponible',
      community: ''
    }
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' },
      body: data
    })
    const response = httpMocks.createResponse()
    user.updateUser(request, response)
    expect(response.statusCode).toBe(200)
  })

  // test('Community is not valid', () => {
  //   const data = {
  //     first_name: 'Usuario',
  //     last_name: '0',
  //     age: '0',
  //     gender: 'O',
  //     phone_number: 'newPhoneNumber',
  //     major: 'Ing. de Computación',
  //     status: 'Disponible',
  //     community: 'Externo'
  //   }
  //   const request = httpMocks.createRequest({
  //     secret: { email: '00-00000@usb.ve' },
  //     body: data
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateUser(request, response)
  //   expect(response.statusCode).toBe(500)
  // })
})

// Falta resolver 3 casos
describe('updateProfilePic', () => {
  const cloudinary = require('cloudinary')
  const config     = require('../Config.js')
  cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.API_KEY,
    api_secret: config.API_SECRET
  })
  var fs = require('fs')
  var stream = cloudinary.uploader.upload_stream(callback)
  const filePath = `./__test__/testFiles/testUserPic.png`
  //from: https://commons.wikimedia.org/wiki/File:User.svg
  const code = { encoding: 'binary' }
  var fileReader = fs.createReadStream(filePath, code).pipe(stream)

  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      isVerify: true,
      temporalCode: 0
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1',
      isVerify: false,
      temporalCode: 123456789
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('User upload his profile picture', () => {
    const request = httpMocks.createRequest({
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.updateProfilePic(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('User does not provide any file', () => {
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.updateProfilePic(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('User provides a not-image file', () => {
  //   const filePath = `./__test__/testFiles/noImageFile.txt`
  //   fileReader = fs.createReadStream(filePath, code).pipe(stream)
  //   const request = httpMocks.createRequest({
  //     file: fileReader,
  //     secret: { email: '00-00000@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateProfilePic(request, response)
  //   expect(response.statusCode).toBe(401)
  // })

  test('Request without email', () => {
    const request = httpMocks.createRequest({
      file: fileReader,
      secret: { email: '' }
    })
    const response = httpMocks.createResponse()
    user.updateProfilePic(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Email does not have an e-mail format', () => {
    const request = httpMocks.createRequest({
      file: fileReader,
      secret: { email: '00-00000' }
    })
    const response = httpMocks.createResponse()
    user.updateProfilePic(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('User is not registered', () => {
  //   const request = httpMocks.createRequest({
  //     file: fileReader,
  //     secret: { email: '00-00001@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateProfilePic(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  // test('User is not verified', () => {
  //   const request = httpMocks.createRequest({
  //     file: fileReader,
  //     secret: { email: '00-00001@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.updateProfilePic(request, response)
  //   expect(response.statusCode).toBe(500)
  // })
})

// Falta resolver 3 casos
describe('addVehicle', () => {
  const cloudinary = require('cloudinary')
  const config     = require('../Config.js')
  cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.API_KEY,
    api_secret: config.API_SECRET
  })
  var fs = require('fs')
  var stream = cloudinary.uploader.upload_stream(callback)
  const filePath = `./__test__/testFiles/testCarPic.png`
  //from: https://pngimg.com/download/22574
  const code = { encoding: 'binary' }
  var fileReader = fs.createReadStream(filePath, code).pipe(stream)

  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      vehicles: [],
      isVerify: true,
      temporalCode: 0
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1',
      isVerify: false,
      temporalCode: 123456789
    }).then(callback)
    userDB.create({
      email: '22-22222@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      vehicles: [{
        plate: 'placa',
        brand: 'marca',
        model: 'modelo',
        year: 2,
        color: 'black',
        vehicle_capacity: 1,
        vehicle_pic: 'FotoCarro'
      }],
      isVerify: true,
      temporalCode: 0
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('User add sucessfully a new Vehicle', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Email does not have an e-mail format', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without email', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  // test('User is not registered', () => {
  //   const data = {
  //     plate: 'placa',
  //     brand: 'marca',
  //     model: 'modelo',
  //     year: '0',
  //     color: 'black',
  //     vehicle_capacity: '1'
  //   }
  //   const request = httpMocks.createRequest({
  //     body: data,
  //     file: fileReader,
  //     secret: { email: '00-00001@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.addVehicle(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  // test('User is not verified', () => {
  //   const data = {
  //     plate: 'placa',
  //     brand: 'marca',
  //     model: 'modelo',
  //     year: '0',
  //     color: 'black',
  //     vehicle_capacity: '1'
  //   }
  //   const request = httpMocks.createRequest({
  //     body: data,
  //     file: fileReader,
  //     secret: { email: '11-11111@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.addVehicle(request, response)
  //   expect(response.statusCode).toBe(500)
  // })

  // test('User cannot add same vehicle twice', () => {
  //   const data = {
  //     plate: 'placa',
  //     brand: 'marca',
  //     model: 'modelo',
  //     year: '0',
  //     color: 'black',
  //     vehicle_capacity: '1'
  //   }
  //   const request = httpMocks.createRequest({
  //     body: data,
  //     file: fileReader,
  //     secret: { email: '22-22222@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.addVehicle(request, response)
  //   expect(response.statusCode).toBe(403)
  // })

  test('User does not provide any vehicle picture', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without plate', () => {
    const data = {
      plate: '',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without brand', () => {
    const data = {
      plate: 'placa',
      brand: '',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without model', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: '',
      year: '0',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without year', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Year is not an integer', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: 'a',
      color: 'black',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without color', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: '',
      vehicle_capacity: '1'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Request without capacity', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: ''
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Vehicle capacity is not an integer', () => {
    const data = {
      plate: 'placa',
      brand: 'marca',
      model: 'modelo',
      year: '0',
      color: 'black',
      vehicle_capacity: 'a'
    }
    const request = httpMocks.createRequest({
      body: data,
      file: fileReader,
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.addVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })
})

// Falta 1 caso
describe('deleteVehicle', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0',
      first_name: 'Usuario',
      last_name: '0',
      vehicles: [{
        plate: 'placa',
        brand: 'marca',
        model: 'modelo',
        year: 0,
        color: 'black',
        vehicle_capacity: 1,
        vehicle_pic: 'FotoCarro'
      }],
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1',
      first_name: 'Usuario',
      last_name: '1',
      vehicles: [],
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('User deletes one of his vehicules', () => {
    const request = httpMocks.createRequest({
      body: { plate: 'placa' },
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.deleteVehicle(request, response)
    expect(response.statusCode).toBe(200)
  })

  // test('User cannot delete a nonexisting vehicule', () => {
  //   const request = httpMocks.createRequest({
  //     body: { plate: 'placa' },
  //     secret: { email: '11-11111@usb.ve' }
  //   })
  //   const response = httpMocks.createResponse()
  //   user.deleteVehicle(request, response)
  //   expect(response.statusCode).toBe(403)
  // })

  test('A request without plate', () => {
    const request = httpMocks.createRequest({
      body: { plate: '' },
      secret: { email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    user.deleteVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('Email does not have an e-mail format', () => {
    const request = httpMocks.createRequest({
      body: { plate: 'placa' },
      secret: { email: '00-00000' }
    })
    const response = httpMocks.createResponse()
    user.deleteVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })

  test('A request without email', () => {
    const request = httpMocks.createRequest({
      body: { plate: 'placa' },
      secret: { email: '' }
    })
    const response = httpMocks.createResponse()
    user.deleteVehicle(request, response)
    expect(response.statusCode).toBe(401)
  })
})
