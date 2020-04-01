/**
 * Este módulo contiene el grafo no dirigido e implícito de las paradas del
 * PideCola y las funciones que hacen posible recomendarle a usuarios
 * conductores los posibles usuarios a los que se les puede dar una cola.
 * @module algorithmController
 * @author Francisco Márquez <12-11163@usb.ve>
 * @require módulo: controllers/algorithmController
 * @require lib/utils/response.response
 */

const requests = require('./requestsController.js')
const response = require('../lib/utils/response').response

/**
 * @typedef Graph
 * @type {Object[]}
 * @property {Object} stops - Dos paradas
 * @property {string} stops.from - Parada inicial
 * @property {string} stops.to - Parada final
 * @property {number} distance - Separación en km entre las paradas
 * @private
 * @author Francisco Márquez <12-11163@usb.ve>
 */

/**
 * Representa el grafo no dirigido e implícito de las paradas del PideCola.
 * La distancia entre cada par de paradas se calcula MANUALMENTE como se sigue:
 * 1. Usando Google Maps, seleccionar el punto donde la parada está ubicada.
 * 2. Con cuidado se va construyendo la ruta desde una parada a otra:
 *   2.1 Si son rutas normales USB-Parada basta con marcar la USB como punto
 *   final
 *   2.2 Si son dos Paradas X,Y diferentes a la USB y diferentes entre sí es
 *   recomendable no seleccionar solo la parada sino construir la ruta que
 *   seguiría un autobús si tuviese que moverse de una parada a otra:
 *   usualmente siguiendo por las autopistas, para minimizar tiempo y
 *   distancia.
 * 3. Se toma la distancia que reporta Google Maps como la propiedad distance.
 *
 * ADVERTENCIA: Hacer esto con las herramientas automáticas de Google Maps
 * puede conllevar a inconsistencias importantes en el funcionamiento del
 * algoritmo de recomendación y con ello en todo el funcionamiento de la
 * aplicación. Hacerlo manual es tedioso pero garantiza consistencia entre la
 * ciudad real y su imagen dentro de la aplicación.
 *
 * RECOMENDACIONES FINALES: Construir la lista ordenada por distancia conlleva
 * a una mejora importante para la aplicación al no tener que ordenar las
 * paradas cada vez que el algoritmo es ejecutado.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @name stops
 * @type {Graph}
 * @constant
 * @private
 */
const stops = [
  { stops: { from: 'USB', to: 'Baruta' }, distance: 4.2 },
  { stops: { from: 'Bellas Artes', to: 'La Paz' }, distance: 6.9 },
  { stops: { from: 'Chacaito', to: 'Bellas Artes' }, distance: 8.0 },
  { stops: { from: 'Coche', to: 'Bellas Artes' }, distance: 10.5 },
  { stops: { from: 'Baruta', to: 'Chacaito' }, distance: 11.0 },
  { stops: { from: 'Chacaito', to: 'La Paz' }, distance: 11.3 },
  { stops: { from: 'Coche', to: 'La Paz' }, distance: 12.5 },
  { stops: { from: 'USB', to: 'Coche' }, distance: 13.3 },
  { stops: { from: 'Coche', to: 'Chacaito' }, distance: 13.4 },
  { stops: { from: 'Baruta', to: 'Bellas Artes' }, distance: 15.1 },
  { stops: { from: 'USB', to: 'Chacaito' }, distance: 16.65 },
  { stops: { from: 'Baruta', to: 'Coche' }, distance: 19.3 },
  { stops: { from: 'USB', to: 'La Paz' }, distance: 20.2 },
  { stops: { from: 'Baruta', to: 'La Paz' }, distance: 21.1 },
  { stops: { from: 'USB', to: 'Bellas Artes' }, distance: 21.8 }
]

/**
 * Indica si la parada elem está en el conjunto set.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} elem - Una parada
 * @param {Object} set  - Un conjunto de dos paradas
 * @returns {boolean}
 */
function member (elem, set) {
  return set.from === elem || set.to === elem
}

/**
 * Indica si la parada elem no está en el conjunto set.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @param {Object} set  - Un conjunto de dos paradas
 * @returns {boolean}
 */
function notMember (elem, set) {
  return !member(elem, set)
}

/**
 * Retorna todos los elementos en set que cumplen con predicate.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Array}    set       - Un arreglo
 * @param {function} predicate - Un función que devuelve un booleano
 * @returns {Array}
 */
function filter (set, predicate) {
  const filtered = []
  for (let i = 0; i < set.length; i++) {
    if (predicate(set[i])) {
      filtered.push(set[i])
    }
  }
  return filtered
}

/**
 * Retorna las paradas en a que no son b
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {Object} a - Un conjunto de dos paradas
 * @param {string} b - Una parada
 * @returns {string|Object}
 */
function difference (a, b) {
  if (a.from === b) {
    return a.to
  } else if (a.to === b) {
    return a.from
  } else {
    return a
  }
}

/**
 * Implementación del algoritmo de recomendación.
 * El primer elemento es la parada recibida y la cola está ordenada
 * crecientemente en distancia respecto de la parada recibida
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @private
 * @param {string} stop - Una parada
 * @returns {Stop[]}
 */
function prioridad (stop) {
  const output = [requests.requestsList[requests.cast(stop)]]
  const f = filter(stops, e => {
    return member(stop, e.stops) && notMember('USB', e.stops)
  })
  const m = f.map(e => {
    return { detour: difference(e.stops, stop), distance: e.distance }
  })
  const s = m.sort((dest1, dest2) => {
    if (dest1.distance < dest2.distance) {
      return -1
    } else if (dest1.distance > dest2.distance) {
      return 1
    } else {
      return 0
    }
  })
  for (let i = 0; i < s.length; i++) {
    output.push(requests.requestsList[requests.cast(s[i].detour)])
  }
  return output
}

/**
 * Endpoint para recomendar solicitudes de cola.
 * No debería modificarse a no ser que se cambie toda lógica detrás del
 * algoritmo de recomendación.
 * @author Francisco Márquez <12-11163@usb.ve>
 * @public
 * @param {Object} req - Un HTTP Request
 * @param {Object} res - Un HTTP Response
 * @returns {Object}
 */
function recommend (req, res) {
  const rides = require('../models/rideModel')

  const fran = '12-11163@usb.ve', javi = '12-11067@usb.ve'
  const pedro = '13-10790@usb.ve', andre = '12-10660@usb.ve'
  const dummy1 = '13-11209@usb.ve', dummy2 = '13-10000@usb.ve'
  rides.deleteMany({}).then(sucs => sucs)
  rides.create({
    rider: fran,
    passenger: [javi, pedro],
    available_seats: 2,
    status: 'Finalizado',
    start_location: 'Baruta',
    destination: 'USB',
    time: new Date(2020, 4, 8, 7, 30, 0, 0),
    ride_finished: true,
    comments: [
      { user_id: fran, like: true, dislike: false, comment: 'LIKE' },
      { user_id: javi, like: true, dislike: false, comment: 'LIKE' },
      { user_id: pedro, like: true, dislike: false, comment: 'LIKE' }
    ]
  }).then(sucs => sucs)

  rides.create({
    rider: andre,
    passenger: [dummy1, dummy2],
    available_seats: 2,
    status: 'Finalizado',
    start_location: 'Baruta',
    destination: 'USB',
    time: new Date(2020, 4, 8, 7, 45, 0, 0),
    ride_finished: true,
    comments: [
      { user_id: andre, like: false, dislike: true, comment: 'DISLIKE' },
      { user_id: dummy1, like: false, dislike: true, comment: 'DISLIKE' },
      { user_id: dummy2, like: false, dislike: true, comment: 'DISLIKE' }
    ]
  }).then(sucs => sucs)

  rides.create({
    rider: javi,
    passenger: [fran, pedro],
    available_seats: 2,
    status: 'Finalizado',
    start_location: 'Baruta',
    destination: 'USB',
    time: new Date(2021, 4, 8, 7, 30, 0, 0),
    ride_finished: true,
    comments: [
      { user_id: javi, like: false, dislike: true, comment: 'DISLIKE' },
      { user_id: pedro, like: true, dislike: false, comment: 'LIKE' }
    ]
  }).then(sucs => sucs)

  rides.create({
    rider: andre,
    passenger: [dummy1, dummy2],
    available_seats: 2,
    status: 'Finalizado',
    start_location: 'Baruta',
    destination: 'USB',
    time: new Date(2021, 4, 8, 7, 45, 0, 0),
    ride_finished: true,
    comments: [
      { user_id: dummy1, like: true, dislike: false, comment: 'LIKE' },
      { user_id: dummy2, like: false, dislike: true, comment: 'DISLIKE' }
    ]
  }).then(sucs => sucs)

  rides.create({
    rider: dummy1,
    passenger: [dummy2],
    available_seats: 1,
    status: 'Finalizado',
    start_location: 'Baruta',
    destination: 'USB',
    time: new Date(2021, 4, 8, 8, 45, 0, 0),
    ride_finished: true,
    comments: []
  }).then(sucs => sucs)
  try {
    const info = prioridad(req.body.destination)
    return res.status(200).send(response(true, info, ''))
  } catch (error) {
    console.log('Errores: ', error)
    return res.status(400).send(response(false, {}, 'Ha ocurrido un error'))
  }
}

module.exports.recommend = recommend
