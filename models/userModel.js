'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true },
    age: { type: Number },
    genre: { type: String },
    profile_pic: { type: Schema.Types.ObjectId, ref: 'Img' },
    vehicles:
        [{
          plate: { type: String },
          model: { type: String },
          year: { type: Number },
          color: { type: String },
          vehicle_pic: { type: Schema.Types.ObjectId, ref: 'Img' }

        }],
    rides_given: { type: Number },
    rides_recieved: { type: Number }
  }
)

const User = mongoose.model('user', UserSchema)
module.exports = User
