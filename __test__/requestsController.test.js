const requests = require('../controllers/requestsController.js')
const httpMocks = require('node-mocks-http')

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

  test('requestsList only contains stop at "La Paz"', () => {
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
  test('A new request is added to the resquestsList', () => {
    const data = {
      user: '12-11163@usb.ve',
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
    expect(response.statusCode).toBe(200)
  })

  test('A request without "USB"', () => {
    const data = {
      user: 'XXXXXX@usb.ve',
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
    expect(response.statusCode).toBe(500)
  })

  test('A request without email', () => {
    const data = {
      user: 'XXXXXXusb.ve',
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
      user: 'XXXXXX@usb.ve',
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
    expect(response.statusCode).toBe(500)
  })

  test('You cannot request for a ride twice', () => {
    const data = {
      user: 'XXXXXX@usb.ve',
      startLocation: 'USB',
      destination: 'Maracay',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response1 = httpMocks.createResponse()
    var response2 = httpMocks.createResponse()
    requests.create(request, response1)
    requests.create(request, response2)
    expect(response2.statusCode).toBe(500)
  })
})

describe('delete', () => {
  beforeEach(() => {
    requests.requestsList[4].requests.push({
      user: '12-11163@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    })
    requests.requestsList[0].requests.push({
      user: '12-11164@usb.ve',
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
      user: '12-11163@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.delete(request, response)
    const newSize =
      requests.requestsList[0].requests.length +
      requests.requestsList[1].requests.length +
      requests.requestsList[2].requests.length +
      requests.requestsList[3].requests.length +
      requests.requestsList[4].requests.length
    expect((size - newSize) * response.statusCode).toBe(200)
  })

  test('If request does not exist return code 500', () => {
    const data = {
      user: '12-11162@usb.ve',
      startLocation: 'Baruta',
      destination: 'USB',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.delete(request, response)
    expect(response.statusCode).toBe(500)
  })

  test('A request without email', () => {
    const data = {
      user: 'XXXXXXusb.ve',
      startLocation: 'USB',
      destination: 'Baruta',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.delete(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('A request without "USB"', () => {
    const data = {
      user: 'XXXXXX@usb.ve',
      startLocation: 'Baruta',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.delete(request, response)
    expect(response.statusCode).toBe(500)
  })
})

describe('changeStatus', () => {
  beforeEach(() => {
    const data = {
      user: '12-11163@usb.ve',
      startLocation: 'USB',
      destination: 'Bellas Artes',
      comment: 'Nothing',
      im_going: 'Who cares?'
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
  })

  afterEach(() => {
    requests.requestsList.forEach(e => e.requests = [])
  })

  test('Change status from an existing request', () => {
    data = {
      user: "12-11163@usb.ve",
      place: "Bellas Artes"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.changeStatus(request, response)
    const status = requests.requestsList[4].requests[0].status
    expect(status).toBe(false)
  })

  test('No Change status from an not-existing request', () => {
    data = {
      user: "12-11164@usb.ve",
      place: "Bellas Artes"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.changeStatus(request, response)
    const status = requests.requestsList[4].requests[0].status
    expect(status).toBe(true)
  })

  test('Raise error when place it is USB', () => {
    data = {
      user: "12-11163@usb.ve",
      place: "USB"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.changeStatus(request, response)
    expect(response.statusCode).toBe(400)
  })

  test('Raise error when place it is not a valid stop (Maracay)', () => {
    data = {
      user: "12-11163@usb.ve",
      place: "Maracay"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.changeStatus(request, response)
    expect(response.statusCode).toBe(400)
  })
})