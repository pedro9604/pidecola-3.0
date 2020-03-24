const user = require('../controllers/userController.js')
const ride = require('../controllers/rideController.js')
const usr = require('../models/userModel.js')
const httpMocks = require('node-mocks-http')

describe('create', () => {
  beforeEach(() => {
    const data = {
      email: 'XXXXXX@usb.ve',
      password: 'password',
      phoneNumber: 'phoneNumber'
    }
    var request = httpMocks.createRequest({ body: data })
    var response = httpMocks.createResponse()
    user.create(request, response)
  })

  afterEach(() => { usr.deleteOne({ email: 'XXXXXX@usb.ve' }) })

  test('rider with a passenger from A to B', () => {
    const data = {
      rider: 'XXXXXX@usb.ve',
      passenger: [],
      seats: '0',
      startLocation: 'A',
      destination: 'B'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(200)
  })

  /*
  test('rider is not an email', () => {
    const data = {
      rider: 'XXXXXX',
      passenger: ["13-10931@usb.ve"],
      seats: '0',
      startLocation: 'A',
      destination: 'B'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('seats is not a number', () => {
    const data = {
      rider: 'XXXXXX@usb.ve',
      passenger: ["13-10931@usb.ve"],
      seats: 'a',
      startLocation: 'A',
      destination: 'B'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('startLocation is not an string', () => {
    const data = {
      rider: 'XXXXXX@usb.ve',
      passenger: ["13-10931@usb.ve"],
      seats: '1',
      startLocation: 1,
      destination: 'B'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('destination is not an string', () => {
    const data = {
      rider: 'XXXXXX@usb.ve',
      passenger: ["13-10931@usb.ve"],
      seats: '1',
      startLocation: 'A',
      destination: 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('Rider cannot be a passenger', () => {
    const data = {
      rider: 'XXXXXX@usb.ve',
      passenger: ['XXXXXX@usb.ve'],
      seats: '1',
      startLocation: 'A',
      destination: 'B'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400)
  })
  */
})

/* describe('endRide', () => {
  test('A passenger insert a comment about the ride', () => {
    // test code
  });

  test('A passenger is the rider', () => {
    // test code
  });

  test('\'Like\' be equal to \'Dislike\'', () => {
    // test code
  });

  test('Comment is not an string', () => {
    // test code
  });
}); */
