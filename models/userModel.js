'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['M','F','O'] },
    profile_pic: { type: Schema.Types.ObjectId, ref: 'Img' },
    status: { type: String, enum: ['Disponible', 'No Disponible']},
    community: { type: String, enum: ['Estudiante', 'Profesor', 'Egresado', 'Personal Administrativo', 'Obrero']},
    vehicles:
        [{
          plate: { type: String },
          model: { type: String },
          year: { type: Number },
          color: { type: String },
          vehicle_capacity: {type: Number},
          vehicle_pic: [{ type: Schema.Types.ObjectId, ref: 'Img' }]

        }],
    license: { type: String },    
    rides_given: { type: Number },
    rides_recieved: { type: Number },
    likes_count: { type: Number },
    dislikes_count: { type: Number },
    last_ride: { type: Schema.Types.ObjectId, ref: 'Ride'},
    frequent_routes: { type: Array },


  }, {
    timestamps: true
  }
)

const User = mongoose.model('user', UserSchema)
module.exports = User
