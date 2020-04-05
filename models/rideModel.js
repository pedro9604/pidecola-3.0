'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RideSchema = new Schema(
  {
    rider: { type: String, ref: 'User', required: true },
    passenger: { type: Array, required: true },
    available_seats: { type: Number },
    status: { type: String, enum: ['En Espera', 'En Camino', 'Finalizado', 'Accidentado'] },
    start_location: { type: String },
    destination: { type: String },
    time: { type: Date },
    ride_finished: { type: Boolean },
    comments:
      [{
        user_email: { type: String, ref: 'User' },
        like: { type: Boolean },
        dislike: { type: Boolean },
        comment: { type: 'String' }
      }]
  }
)

const Ride = mongoose.model('ride', RideSchema)
module.exports = Ride
