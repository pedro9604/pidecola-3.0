const user = require('../controllers/userController.js')
const ride = require('../controllers/rideController.js')
const httpMocks  = require('node-mocks-http')

describe('create', () => {
  test('rider with a passenger from A to B', () => {
    const data = {
      "rider": "XXXXXX@usb.ve",
      "passenger": [],
      "seats": "0",
      "start_location": "A",
      "destination": "B"
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
      "rider": "XXXXXX",
      "passenger": [],
      "seats": "0",
      "start_location": "A",
      "destination": "B"
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
      "rider": "XXXXXX@usb.ve",
      "passenger": [],
      "seats": "a",
      "start_location": "A",
      "destination": "B"
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
      "rider": "XXXXXX@usb.ve",
      "passenger": [],
      "seats": "0",
      "start_location": 1,
      "destination": "B"
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
      "rider": "XXXXXX@usb.ve",
      "passenger": [],
      "seats": "0",
      "start_location": "A",
      "destination": 1
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(400);
  });

  test('Rider cannot be a passenger', () => {

    var mockUser = {
      "email": "XXXXXX@usb.ve",
      "password": "13456",
      "phoneNumber": "01234567890"
    }

    var mockReq = httpMocks.createRequest({
      body: mockUser
    })

    var mockRes = httpMocks.createResponse()

    user.create(mockReq, mockRes)

    const data = {
      "rider": "XXXXXX@usb.ve",
      "passenger": [user.findByEmail("XXXXXX@usb.ve")],
      "seats": "0",
      "start_location": "A",
      "destination": "B"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    ride.create(request, response)
    expect(response.statusCode).toBe(200);
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