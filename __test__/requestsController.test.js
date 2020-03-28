const callback  = require('../lib/utils/utils').callbackReturn
const httpMocks = require('node-mocks-http')
const requests  = require('../controllers/requestsController')
const userDB    = require('../models/userModel')

describe('requestsList', () => {
  test('requestsList is available', () => {
    expect(!requests.requestsList).toBe(false)
  })

  test('requestsList only contains stop at "Baruta"', () => {
    expect(requests.requestsList[0].name).toBe('Baruta')
  })

  test('requestsList only contains stop at "Coche"', () => {
    expect(requests.requestsList[1].name).toBe('Coche')
  })

  test('requestsList only contains stop at "Chacaito"', () => {
    expect(requests.requestsList[2].name).toBe('Chacaito')
  })

  test('requestsList only contains stop at "LaPaz"', () => {
    expect(requests.requestsList[3].name).toBe('La Paz')
  })

  test('requestsList only contains stop at "Bellas Artes"', () => {
    expect(requests.requestsList[4].name).toBe('Bellas Artes')
  })

  test('requestsList does not contain stop at "USB"', () => {
    const baruta = requests.requestsList[0].name === 'USB'
    const coche = requests.requestsList[1].name === 'USB'
    const chacaito = requests.requestsList[2].name === 'USB'
    const laPaz = requests.requestsList[3].name === 'USB'
    const bellasArtes = requests.requestsList[4].name === 'USB'
    const usb = baruta || coche || chacaito || laPaz || bellasArtes
    expect(usb).toBe(false)
  })

  test('requestsList does not contain other stop', () => {
    const guarenas = requests.requestsList[0].name === 'USB'
    const teques = requests.requestsList[1].name === 'USB'
    const charallave = requests.requestsList[2].name === 'USB'
    const maracay = requests.requestsList[3].name === 'USB'
    const laGuaira = requests.requestsList[4].name === 'USB'
    const usb = guarenas || teques || charallave || maracay || laGuaira
    expect(usb).toBe(false)
  })
})

describe('create', () => {
  beforeEach(() => {
    for (var i = 0; i < 2; i++) {
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
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
    requests.requestsList[0].requests = []
  })

  test('A new request is added to the resquestsList', () => {
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'Baruta',
      destination: 'USB',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('A request without "USB"', () => {
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'Bellas Artes',
      destination: 'Baruta',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request without email', () => {
    const data = {
      user: '00-00000',
      startLocation: 'USB',
      destination: 'Baruta',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request out of our stops (Maracay)', () => {
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Maracay',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('You cannot request for a ride twice', () => {
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Maracay',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request1 = httpMocks.createRequest({
      body: data
    })
    var request2 = httpMocks.createRequest({
      body: data
    })
    var response1 = httpMocks.createResponse()
    var response2 = httpMocks.createResponse()
    requests.create(request1, response1)
    requests.create(request2, response2)
    expect(response2.statusCode).toBe(400)
  })
})

describe('cancel', () => {
  beforeEach(() => {
    requests.requestsList[4].requests.push({
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    })
    requests.requestsList[0].requests.push({
      user: '11-11111@usb.ve',
      startLocation: 'Baruta',
      destination: 'USB',
      comment: 'Nothing',
      im_going: 'Who cares?'
    })
  })

  afterEach(() => {
    requests.requestsList.forEach(e => e.requests = [])
  })

  test('A request is removed from the resquestsList', () => {
    const size =
      requests.requestsList[0].requests.length +
      requests.requestsList[1].requests.length +
      requests.requestsList[2].requests.length +
      requests.requestsList[3].requests.length +
      requests.requestsList[4].requests.length
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.cancel(request, response)
    const newSize =
      requests.requestsList[0].requests.length +
      requests.requestsList[1].requests.length +
      requests.requestsList[2].requests.length +
      requests.requestsList[3].requests.length +
      requests.requestsList[4].requests.length
    expect((size - newSize) * response.statusCode).toBe(200)
  })

  test('If request does not exist return code 200', () => {
    const data = {
      user: '00-00001@usb.ve',
      startLocation: 'Baruta',
      destination: 'USB',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.cancel(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('A request without email', () => {
    const data = {
      user: '00-00000',
      startLocation: 'USB',
      destination: 'Baruta',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.cancel(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request without "USB"', () => {
    const data = {
      user: '00-00000@usb.ve',
      startLocation: 'Baruta',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.cancel(request, response)
    expect(response.statusCode).toBe(400)
  })
})

describe('updateStatus', () => {
  beforeEach(() => {
    const data = {
      email: '00-00000@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?',
      status: true
    }
    requests.requestsList[4].requests.push(data)
  })

  afterEach(() => {
    requests.requestsList.forEach(e => e.requests = [])
  })

  test('Change status from an existing request', () => {
    const data = {
      user: '00-00000@usb.ve',
      place: 'Bellas Artes'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.updateStatus(request, response)
    const status = requests.requestsList[4].requests[0].status
    expect(status).toBe(false)
  })

  test('No Change status from an nonexisting request', () => {
    data = {
      user: '00-00001@usb.ve',
      place: 'Bellas Artes'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.updateStatus(request, response)
    const status = requests.requestsList[4].requests[0].status
    expect(status).toBe(true)
  })

  test('Raise error when place it is USB', () => {
    data = {
      user: '00-00000@usb.ve',
      place: 'USB'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.updateStatus(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('Raise error when place it is not a valid stop (Maracay)', () => {
    data = {
      user: '00-00000@usb.ve',
      place: 'Maracay'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.updateStatus(request, response)
    expect(response.statusCode).toBe(400)
  })
})

describe('offerRide', () => {
  beforeEach(() => {
    for (var i = 0; i < 2; i++) {
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
      requests.requestsList[0].requests.push({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        user: {
          usbid: i + (i + '-' + i + i + i + i + i),
          phone: 'phoneNumber' + i,
          fName: 'Usuario',
          lName: '' + i,
          major: 'Ing. de Computación',
          prPic: 'Foto' + i
        },
        startLocation: 'Baruta',
        destination: 'USB',
        comment: 'Nothing',
        im_going: 'Who cares?',
        status: true
      })
    }
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
    requests.requestsList[0].requests = []
  })

  test('User0 offers a ride to User1', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111@usb.ve'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.offerRide(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('rider is not an email', () => {
    const data = {
      rider: '00-00000',
      passenger: '11-11111@usb.ve'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.offerRide(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('passenger is not an email', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.offerRide(request, response)
    expect(response.statusCode).toBe(400)
  })
})

describe('respondOfferRide', () => {
  beforeEach(() => {
    for (var i = 0; i < 2; i++) {
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
      requests.requestsList[0].requests.push({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve'),
        user: {
          usbid: i + (i + '-' + i + i + i + i + i),
          phone: 'phoneNumber' + i,
          fName: 'Usuario',
          lName: '' + i,
          major: 'Ing. de Computación',
          prPic: 'Foto' + i
        },
        startLocation: 'Baruta',
        destination: 'USB',
        comment: 'Nothing',
        im_going: 'Who cares?',
        status: false
      })
    }
  })

  afterEach(() => {
    for (var i = 0; i < 2; i++) {
      userDB.deleteOne({
        email: i + (i + '-' + i + i + i + i + i + '@usb.ve')
      }).then(callback)
    }
    requests.requestsList[0].requests = []
  })

  test('User1 accepts ride offer from User0', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111@usb.ve',
      accept: 'Sí'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.respondOfferRide(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('User1 rejects ride offer from User0', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111@usb.ve',
      accept: 'No'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.respondOfferRide(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('rider is not an email', () => {
    const data = {
      rider: '00-00000',
      passenger: '11-11111@usb.ve',
      accept: 'Sí'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.respondOfferRide(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('passenger is not an email', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111',
      accept: 'Sí'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.respondOfferRide(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('accept is neither "Sí" nor "No"', () => {
    const data = {
      rider: '00-00000@usb.ve',
      passenger: '11-11111',
      accept: 'Yes'
    }
    const request = httpMocks.createRequest({
      body: data
    })
    const response = httpMocks.createResponse()
    requests.respondOfferRide(request, response)
    expect(response.statusCode).toBe(400)
  })
})