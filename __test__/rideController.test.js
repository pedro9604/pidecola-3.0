const callback = require('../lib/utils/utils').callbackReturn
const httpMocks = require('node-mocks-http')
const ride = require('../controllers/rideController.js')
const rideDB = require('../models/rideModel.js')
const userDB = require('../models/userModel.js')

describe('create', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0'
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1'
      }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
      rideDB.deleteOne({
        rider: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('rider with a passenger from USB to Baruta', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('rider is not an email', () => {
    const data = {
      rider: '11-11111',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('rider is not an registered user', () => {
    const data = {
      rider: '11-11112@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('seats is not a number', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: 'a',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 1,
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not a valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Maracay',
      destination: 'USB'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Maracay'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A ride without "USB"', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Chacaito',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Rider cannot be a passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('It must be at least one passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: [],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Seats cannot be less than passengers', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })
})

describe('endRide', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0'
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1'
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      available_seats: 1,
      status: 'En Camino',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: false,
      comments: []
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
      rideDB.deleteOne({
        rider: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('Ending an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('Ending an nonexisting ride', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(500)
    })
  })

  test('rider is not an email', () => {
    const data = {
      rider: '11-11111',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('rider is not an registered user', () => {
    const data = {
      rider: '11-11112@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('seats is not a number', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: 'a',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 1,
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not a valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Maracay',
      destination: 'USB'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Maracay'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A ride without "USB"', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Chacaito',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Rider cannot be a passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('It must be at least one passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: [],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Seats cannot be less than passengers', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })
})

describe('changeStatus', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0'
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1'
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      available_seats: 1,
      status: 'En Espera',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: false,
      comments: []
    }).then(callback)
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'En Camino',
      start_location: 'USB',
      destination: 'Baruta',
      time: new Date(2020, 4, 9, 12, 30, 0, 0),
      ride_finished: false,
      comments: []
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
      rideDB.deleteOne({
        rider: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('change status to "En Espera"', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Espera'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('change status to "En Camino"', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('change status to "Accidentado"', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'Accidentado'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('change status to "Finalizado"', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'Finalizado'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('rider is not an email', () => {
    const data = {
      rider: '11-11111',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('rider is not an registered user', () => {
    const data = {
      rider: '11-11112@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('seats is not a number', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: 'a',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 1,
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not a valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Maracay',
      destination: 'USB'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 1,
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an valid stop', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Maracay'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A ride without "USB"', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '1',
      startLocation: 'Chacaito',
      destination: 'Baruta'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Rider cannot be a passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['11-11111@usb.ve'],
      seats: '1',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('It must be at least one passenger', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: [],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Seats cannot be less than passengers', () => {
    const data = {
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      seats: '0',
      startLocation: 'USB',
      destination: 'Baruta',
      status: 'En Camino'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })
})

describe('commentARide', () => {
  beforeEach(() => {
    userDB.create({
      email: '00-00000@usb.ve',
      password: 'password0',
      phone_number: 'phoneNumber0'
    }).then(callback)
    userDB.create({
      email: '11-11111@usb.ve',
      password: 'password1',
      phone_number: 'phoneNumber1'
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['00-00000@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
      rideDB.deleteOne({
        rider: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
  })

  test('User inserts a positive comment about an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí',
      comment: 'I liked it'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('User inserts a negative comment about an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'No',
      comment: 'I did not like it'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('User inserts a like without comment about an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('User inserts a dislike without comment about an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'No'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('Rider inserts a positive comment about an existing ride', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '11-1111@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí',
      comment: 'I liked it'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('Rider is not an email', () => {
    const data = {
      rider: '11-11111',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí',
      comment: 'I liked it'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('User is not an email', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí',
      comment: 'I liked it'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('rider is not an registered user', () => {
    const data = {
      rider: '11-11112@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Baruta',
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 1,
      destination: 'USB',
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('startLocation is not a valid stop', () => {
    const data = {
      rider: '11-11112@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Maracay',
      destination: 'USB',
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an string', () => {
    const data = {
      rider: '11-11112@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 1,
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('destination is not an valid stop', () => {
    const data = {
      rider: '11-11112@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Maracay',
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('A ride without "USB"', () => {
    const data = {
      rider: '11-11112@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Chacaito',
      destination: 'Baruta',
      like: 'Sí',
      comment: '1'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })

  test('Comment is not an string', () => {
    const data = {
      rider: '11-11111@usb.ve',
      user: '00-00000@usb.ve',
      startLocation: 'Coche',
      destination: 'USB',
      like: 'Sí',
      comment: 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.commentARide(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(400)
    })
  })
})
