const requests = require('./requestsController.js')
const response   = require('../lib/utils/response').response

const stops = [
  {stops: {from: "USB", to: "Baruta"}, distance: 4.2},
  {stops: {from: "Bellas Artes", to: "La Paz"}, distance: 6.9},
  {stops: {from: "Chacaito", to: "Bellas Artes"}, distance: 8.0},
  {stops: {from: "Coche", to: "Bellas Artes"}, distance: 10.5},
  {stops: {from: "Baruta", to: "Chacaito"}, distance: 11.0},
  {stops: {from: "Chacaito", to: "La Paz"}, distance: 11.3},
  {stops: {from: "Coche", to: "La Paz"}, distance: 12.5},
  {stops: {from: "USB", to: "Coche"}, distance: 13.3},
  {stops: {from: "Coche", to: "Chacaito"}, distance: 13.4},
  {stops: {from: "Baruta", to: "Bellas Artes"}, distance: 15.1},
  {stops: {from: "USB", to: "Chacaito"}, distance: 16.65},
  {stops: {from: "Baruta", to: "Coche"}, distance: 19.3},
  {stops: {from: "USB", to: "La Paz"}, distance: 20.2},
  {stops: {from: "Baruta", to: "La Paz"}, distance: 21.1},
  {stops: {from: "USB", to: "Bellas Artes"}, distance: 21.8}
]

const member = (elem, set) => { return set.from == elem || set.to == elem }

const notMember = (elem, set) => { return !member(elem, set) }

const filter = (set, predicate) => {
  var filtered = []
  for (var i = 0; i < set.length; i++) {
    if (predicate(set[i])) {
      filtered.push(set[i])
    }
  }
  return filtered
}

const difference = (a, b) => {
  if (a.from == b) {
    return a.to
  } else if (a.to == b) {
    return a.from
  } else {
    return a
  }
}

prioridad = stop => {
  output = [requests.requestsList[requests.cast(stop)]]
  f = filter(stops, e => {
    return member(stop, e.stops) && notMember("USB", e.stops)
  })
  m = f.map(e => {
    return {detour: difference(e.stops, stop), distance: e.distance}
  })
  s = m.sort((dest1, dest2) => {
    if (dest1.distance < dest2.distance) {
      return -1
    } else if (dest1.distance > dest2.distance) {
      return 1
    } else {
      return 0
    }
  })
  for (var i = 0; i < s.length; i++) {
    output.push(requests.requestsList[requests.cast(s[i].detour)])
  }
  return output
}

exports.recommend = (req, res) => {
  try {
    var info = prioridad(req.body.destination)
    return res.status(200).send(response(true, info, ''))
  } catch(error) {
    return res.status(400).send(response(false, {}, 'Ha ocurrido un error.'))
  }
}