'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RideSchema = new Schema(
  {
    rider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passenger: { type: Array, required: true },
    start_location: { type: String },
    destination: { type: String },
    time: { type: Date },
    ride_finished: { type: Boolean },
    comment: { type: String }
  }
)

const Ride = mongoose.model('ride', RideSchema)
module.exports = Ride
