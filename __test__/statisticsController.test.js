const callback = require('../lib/utils/utils').callbackReturn
const httpMocks = require('node-mocks-http')
const rideDB = require('../models/rideModel.js')
const statistics = require('../controllers/statisticsController')
const userDB = require('../models/userModel.js')

describe('getRidesGiven', () => {
  beforeEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.create({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        password: 'password' + i,
        phone_number: 'phoneNumber' + i,
        first_name: 'Usuario',
        last_name: '' + i,
        age: i,
        gender: 'O',
        major: 'Ing. de Computación',
        profile_pic: 'Foto' + i,
        status: 'Disponible',
        community: 'Estudiante',
        vehicles: [{
          plate: 'placa' + i,
          brand: 'marca' + i,
          model: 'modelo' + i,
          year: i,
          color: 'black',
          vehicle_capacity: 1,
          vehicle_pic: 'FotoCarro' + i
        }],
        isVerify: true,
        temporalCode: i
      }).then(callback)
    }
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
      }).then(callback)
    }
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.deleteOne({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
  })

  test('User0 gave two rides', () => {
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(2)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => {
      console.log('0', e)
      console.log('response ', response._getData())
    })
  })

  test('User1 gave one ride', () => {
    const request = httpMocks.createRequest({
      secret: { email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(1)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('1', e))
  })

  test('User2 gave no rides', () => {
    const request = httpMocks.createRequest({
      secret: { email: '22-22222@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('2', e))
  })
})

describe('getRidesReceived', () => {
  beforeEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.create({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        password: 'password' + i,
        phone_number: 'phoneNumber' + i,
        first_name: 'Usuario',
        last_name: '' + i,
        age: i,
        gender: 'O',
        major: 'Ing. de Computación',
        profile_pic: 'Foto' + i,
        status: 'Disponible',
        community: 'Estudiante',
        vehicles: [{
          plate: 'placa' + i,
          brand: 'marca' + i,
          model: 'modelo' + i,
          year: i,
          color: 'black',
          vehicle_capacity: 1,
          vehicle_pic: 'FotoCarro' + i
        }],
        isVerify: true,
        temporalCode: i
      }).then(callback)
    }
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
      }).then(callback)
    }
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
    rideDB.deleteOne({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: []
    }).then(callback)
  })

  test('User0 received no rides', () => {
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesReceived(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('0', e))
  })

  test('User1 received one ride', () => {
    const request = httpMocks.createRequest({
      secret: { email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesReceived(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(1)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('1', e))
  })

  test('User2 received two rides', () => {
    const request = httpMocks.createRequest({
      secret: { email: '22-22222@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesReceived(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(2)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('2', e))
  })
})

describe('getLikesCount', () => {
  beforeEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.create({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        password: 'password' + i,
        phone_number: 'phoneNumber' + i,
        first_name: 'Usuario',
        last_name: '' + i,
        age: i,
        gender: 'O',
        major: 'Ing. de Computación',
        profile_pic: 'Foto' + i,
        status: 'Disponible',
        community: 'Estudiante',
        vehicles: [{
          plate: 'placa' + i,
          brand: 'marca' + i,
          model: 'modelo' + i,
          year: i,
          color: 'black',
          vehicle_capacity: 1,
          vehicle_pic: 'FotoCarro' + i
        }],
        isVerify: true,
        temporalCode: i
      }).then(callback)
    }
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        },
        {
          user_email: '11-11111@usb.ve',
          like: true,
          dislike: true,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '11-11111@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        }
      ]
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
      }).then(callback)
    }
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        },
        {
          user_email: '11-11111@usb.ve',
          like: true,
          dislike: true,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.deleteOne({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '11-11111@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        }
      ]
    }).then(callback)
  })

  test('User0 received two likes', () => {
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(2)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => {
      console.log('0', e)
      console.log('response ', response._getData())
    })
  })

  test('User1 received no likes', () => {
    const request = httpMocks.createRequest({
      secret: { email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('1', e))
  })

  test('User2 have not been a rider', () => {
    const request = httpMocks.createRequest({
      secret: { email: '22-22222@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('2', e))
  })
})

describe('getDislikesCount', () => {
  beforeEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.create({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        password: 'password' + i,
        phone_number: 'phoneNumber' + i,
        first_name: 'Usuario',
        last_name: '' + i,
        age: i,
        gender: 'O',
        major: 'Ing. de Computación',
        profile_pic: 'Foto' + i,
        status: 'Disponible',
        community: 'Estudiante',
        vehicles: [{
          plate: 'placa' + i,
          brand: 'marca' + i,
          model: 'modelo' + i,
          year: i,
          color: 'black',
          vehicle_capacity: 1,
          vehicle_pic: 'FotoCarro' + i
        }],
        isVerify: true,
        temporalCode: i
      }).then(callback)
    }
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        },
        {
          user_email: '11-11111@usb.ve',
          like: true,
          dislike: true,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.create({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '22-22222@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.create({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '11-11111@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        }
      ]
    }).then(callback)
  })

  afterEach(() => {
    for (var i = 0; i < 3; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
      }).then(callback)
    }
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['11-11111@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 7, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '00-00000@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        },
        {
          user_email: '11-11111@usb.ve',
          like: true,
          dislike: true,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.deleteOne({
      rider: '00-00000@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 8, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '22-22222@usb.ve',
          like: true,
          dislike: false,
          comments: 'LIKE'
        }
      ]
    }).then(callback)
    rideDB.deleteOne({
      rider: '11-11111@usb.ve',
      passenger: ['22-22222@usb.ve'],
      available_seats: 1,
      status: 'Finalizado',
      start_location: 'Coche',
      destination: 'USB',
      time: new Date(2020, 4, 9, 7, 30, 0, 0),
      ride_finished: true,
      comments: [
        {
          user_email: '11-11111@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        },
        {
          user_email: '22-22222@usb.ve',
          like: false,
          dislike: true,
          comments: 'DISLIKE'
        }
      ]
    }).then(callback)
  })

  test('User0 received no dislikes', () => {
    const request = httpMocks.createRequest({
      secret: { email: '00-00000@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => {
      console.log('0', e)
      console.log('response ', response._getData())
    })
  })

  test('User1 received two dislikes', () => {
    const request = httpMocks.createRequest({
      secret: { email: '11-11111@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(2)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('1', e))
  })

  test('User2 have not been a rider', () => {
    const request = httpMocks.createRequest({
      secret: { email: '22-22222@usb.ve' }
    })
    const response = httpMocks.createResponse()
    statistics.getRidesGiven(request, response).then(sucs => {
      expect(sucs._getData().data).toBe(0)
      expect(sucs.statusCode).toBe(200)
    }).catch(e => console.log('2', e))
  })
})
