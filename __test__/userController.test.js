const user      = require('../controllers/userController.js')
const httpMocks = require('node-mocks-http')

describe('create', () => {
  test('A new user is created', () => {
    const data = {
      email: "13-00000@usb.ve",
      password: "C0N5T4Nz4",
      phoneNumber: "09876543210"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('An existed user is not created', () => {
    const data = {
      email: "13-00000@usb.ve",
      password: "C0N5T4Nz4",
      phoneNumber: "09876543210"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response1 = httpMocks.createResponse()
    var response2 = httpMocks.createResponse()
    user.create(request, response1)
    user.create(request, response2)
    expect(response2.statusCode).toBe(500)
  })

  test('A request without email fails', () => {
    const data = {
      email: "13-00000usb.ve",
      password: "C0N5T4Nz4",
      phoneNumber: "09876543210"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request without password fails', () => {
    const data = {
      email: "13-00000@usb.ve",
      password: "",
      phoneNumber: "09876543210"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request without phone number fails', () => {
    const data = {
      email: "13-00000@usb.ve",
      password: "C0N5T4Nz4",
      phoneNumber: ""
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(400)
  })
})