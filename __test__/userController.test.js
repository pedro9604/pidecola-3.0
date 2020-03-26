const user = require('../controllers/userController.js')
const usr  = require('../models/userModel.js')
const httpMocks = require('node-mocks-http')
const callback = require('../lib/utils/utils').callbackReturn

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
    user.create(request, response).then(sucs => {
      expect(sucs.statusCode).toBe(200)
    })
  })

  test('An existed user is not created', () => {
    usr.create({
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phone_number: '09876543210',
      isVerify: true
    }).then(callback)
    const data = {
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
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
      email: '12-11163usb.ve',
      password: 'C0N5T4Nz4',
      phoneNumber: '09876543210'
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
      email: '12-11163@usb.ve',
      password: '',
      phoneNumber: '09876543210'
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
      email: '12-11163@usb.ve',
      password: 'C0N5T4Nz4',
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
