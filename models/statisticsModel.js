'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StatisticsSchema = new Schema(
  {
    user_email: { type: String, ref: 'User', required: true },
    rides_given: { type: Number },
    rides_received: { type: Number },
    likes_count: { type: Number },
    dislikes_count: { type: Number },
    last_ride: { type: Schema.Types.ObjectId, ref: 'Ride' },
    frequent_routes: { type: Array }

  }
)

const Statistics = mongoose.model('user', StatisticsSchema)
module.exports = Statistics
