const algorithm = require('../controllers/algorithmController.js')
const requests = require('../controllers/requestsController.js')
const httpMocks = require('node-mocks-http')

describe('prioridad', () => {
  beforeEach(() => {
    var usr, dest
    for (var i = 0; i < 5; i++) {
      if (i === 0) usr = 'baruta'; dest = 'Baruta'
      else if (i === 1) usr = 'coche'; dest = 'Coche'
      else if (i === 2) usr = 'chacaito'; dest = 'Chacaito'
      else if (i === 3) usr = 'la-paz'; dest = 'La Paz'
      else usr = 'bellas-artes'; dest = 'Bellas Artes'
      for (var j = 1; j < 4; j++) {
        requests.requestsList[i].requests.push({
          user: usr + j + '@usb.ve',
          startLocation: dest,
          destination: 'USB'
        })
      }
      for (var k = 4; k < 7; k++) {
        requests.requestsList[i].requests.push({
          user: usr + k + '@usb.ve',
          startLocation: 'USB',
          destination: dest
        })
      }
    }
  })

  afterEach(() => {
    requests.requestsList.forEach(e => e.requests = [])
  })

  test('Ride from USB to Bellas Artes', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Bellas Artes' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Bellas Artes to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'USB' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to La Paz', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'La Paz' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from La Paz to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'La Paz' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Chacaito', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Chacaito' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Chacaito to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Chacaito' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Coche', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Coche' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Coche to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Coche' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Baruta', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Baruta' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Baruta to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Baruta' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })
})

describe('stress', () => {
  beforeEach(() => {
    for (var i = 0; i < 5; i++) {
      if (i === 0) usr = 'baruta'; dest = 'Baruta'
      else if (i === 1) usr = 'coche'; dest = 'Coche'
      else if (i === 2) usr = 'chacaito'; dest = 'Chacaito'
      else if (i === 3) usr = 'la-paz'; dest = 'La Paz'
      else usr = 'bellas-artes'; dest = 'Bellas Artes'
      for (var j = 1; j < 32769; j++) {
        requests.requestsList[i].requests.push({
          user: usr + j + '@usb.ve',
          startLocation: dest,
          destination: 'USB'
        })
      }
      for (var k = 32769; k < 65536; k++) {
        requests.requestsList[i].requests.push({
          user: usr + k + '@usb.ve',
          startLocation: 'USB',
          destination: dest
        })
      }
    }
  })

  afterEach(() => {
    requests.requestsList.forEach(e => e.requests = [])
  })

  test('Ride from USB to Bellas Artes', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Bellas Artes' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Bellas Artes to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'USB' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to La Paz', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'La Paz' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from La Paz to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'La Paz' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Chacaito', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Chacaito' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Chacaito to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Chacaito' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Coche', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Coche' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Coche to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Coche' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from USB to Baruta', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Baruta' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })

  test('Ride from Baruta to USB', () => {
    var request = httpMocks.createRequest({
      body: { destination: 'Baruta' }
    })
    var response = httpMocks.createResponse()
    algorithm.recommend(request, response)
    expect(response.statusCode).toBe(200)
  })
})
