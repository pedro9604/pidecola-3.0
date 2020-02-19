const user      = require('../controllers/userController.js')
const ride      = require('../controllers/rideController.js')
const usr       = require('../models/userModel.js')
const httpMocks = require('node-mocks-http')

describe('create', () => {
  beforeEach(() => {
    const data = {
      email: "XXXXXX@usb.ve",
      password: "password",
      phoneNumber: "phoneNumber"
    }
    var request  = httpMocks.createRequest({body: data})
    var response = httpMocks.createResponse()
    user.create(request, response)
  })

  afterEach(() => { usr.deleteOne({email: "XXXXXX@usb.ve"}) })

  test('rider with a passenger from A to B', () => {
    const data = {
      rider: "XXXXXX@usb.ve",
      passenger: [],
      seats: "0",
      start_location: "A",
      destination: "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(200);
  });

  test('rider is not an email', () => {
    const data = {
      rider: "XXXXXX",
      passenger: [],
      seats: "0",
      start_location: "A",
      destination: "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });

  test('seats is not a number', () => {
    const data = {
      rider: "XXXXXX@usb.ve",
      passenger: [],
      seats: "a",
      start_location: "A",
      destination: "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });

  test('start_location is not an string', () => {
    const data = {
      rider: "XXXXXX@usb.ve",
      passenger: [],
      seats: "0",
      start_location: 1,
      destination: "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });

  test('destination is not an string', () => {
    const data = {
      rider: "XXXXXX@usb.ve",
      passenger: [],
      seats: "0",
      start_location: "A",
      destination: 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });

  test('Rider cannot be a passenger', () => {
    const data = {
      rider: "XXXXXX@usb.ve",
      passenger: [user.findByEmail("XXXXXX@usb.ve").schema['$id']],
      seats: "0",
      start_location: "A",
      destination: "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });
});

/*describe('endRide', () => {
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
});*/