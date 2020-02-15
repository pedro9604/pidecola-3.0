const requests = require('../controllers/requestsController.js')
const httpMocks = require('node-mocks-http')

describe('requestsList', () => {
  test('requestsList is available', () => {
    expect(!requests.requestsList).toBe(false)
  })

  test('requestsList only contains stop at "Baruta"', () => {
    expect(requests.requestsList[0].name).toBe("Baruta")
  })

  test('requestsList only contains stop at "Coche"', () => {
    expect(requests.requestsList[1].name).toBe("Coche")
  })

  test('requestsList only contains stop at "Chacaito"', () => {
    expect(requests.requestsList[2].name).toBe("Chacaito")
  })

  test('requestsList only contains stop at "La Paz"', () => {
    expect(requests.requestsList[3].name).toBe("La Paz")
  })

  test('requestsList only contains stop at "Bellas Artes"', () => {
    expect(requests.requestsList[4].name).toBe("Bellas Artes")
  })

  test('requestsList does not contain stop at "USB"', () => {
    const baruta      = requests.requestsList[0].name === "USB"
    const coche       = requests.requestsList[1].name === "USB"
    const chacaito    = requests.requestsList[2].name === "USB"
    const laPaz       = requests.requestsList[3].name === "USB"
    const bellasArtes = requests.requestsList[4].name === "USB"
    const usb = baruta || coche || chacaito || laPaz || bellasArtes
    expect(usb).toBe(false)
  })

  test('requestsList does not contain other stop', () => {
    const guarenas   = requests.requestsList[0].name === "USB"
    const teques     = requests.requestsList[1].name === "USB"
    const charallave = requests.requestsList[2].name === "USB"
    const maracay    = requests.requestsList[3].name === "USB"
    const laGuaira   = requests.requestsList[4].name === "USB"
    const usb = guarenas || teques || charallave || maracay || laGuaira
    expect(usb).toBe(false)
  })
})

describe('create', () => {
  test('A new request is added to the resquestsList', () => {
    const size =
      requests.requestsList[0].requests.length +
      requests.requestsList[1].requests.length +
      requests.requestsList[2].requests.length +
      requests.requestsList[3].requests.length +
      requests.requestsList[4].requests.length
    const data = {
      user: "XXXXXX@usb.ve",
      start_location: "USB",
      destination: "Baruta"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    const newSize =
      requests.requestsList[0].requests.length +
      requests.requestsList[1].requests.length +
      requests.requestsList[2].requests.length +
      requests.requestsList[3].requests.length +
      requests.requestsList[4].requests.length
    expect((newSize - size) * response.statusCode).toBe(200)
  })

  test('A request without "USB"', () => {
    const data = {
      user: "XXXXXX@usb.ve",
      start_location: "Bellas Artes",
      destination: "Baruta"
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
      user: "XXXXXXusb.ve",
      start_location: "USB",
      destination: "Baruta"
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
      user: "XXXXXX@usb.ve",
      start_location: "USB",
      destination: "Maracay"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.create(request, response)
    expect(response.statusCode).toBe(500)
  })
})

describe('delete', () => {
  beforeEach(() => {
    requests.requestsList[4].requests.push({
      user: "12-11163@usb.ve",
      start_location: "USB",
      destination: "Bellas Artes"
    })
    requests.requestsList[0].requests.push({
      user: "12-11164@usb.ve",
      start_location: "Baruta",
      destination: "USB"
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
      user: "12-11163@usb.ve",
      start_location: "USB",
      destination: "Bellas Artes"
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
      user: "12-11162@usb.ve",
      start_location: "Baruta",
      destination: "USB"
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
      user: "XXXXXXusb.ve",
      start_location: "USB",
      destination: "Baruta"
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
      user: "XXXXXX@usb.ve",
      start_location: "Baruta",
      destination: "Bellas Artes"
    }
    var request = httpMocks.createRequest({
      body: data
    })
    var response = httpMocks.createResponse()
    requests.delete(request, response)
    expect(response.statusCode).toBe(500)
  })
})