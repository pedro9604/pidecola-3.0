const user = require('../controllers/userController.js')
const httpMocks = require('node-mocks-http')

describe('create', () => {
  test('A new user is created', () => {
    const data = {
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('An existed user is not created', () => {
    const data1 = {
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
    }
    var request1 = httpMocks.createRequest({
      body: data1
    })
    var response1 = httpMocks.createResponse()
    user.create(request1, response1)
    const data2 = {
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
    }
    var request2 = httpMocks.createRequest({
      body: data2
    })
    var response2 = httpMocks.createResponse()
    user.create(request2, response2)
    expect(response2.statusCode).toBe(403)
  })

  test('A request without email fails', () => {
    const data = {
      email: '12-11163usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
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
      email: '12-11163@usb.ve',
      password: '',
      phoneNumber: '09876543210'
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
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: ''
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    user.create(request, response)
    expect(response.statusCode).toBe(400)
  })
})
