'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogSchema = new Schema(
    {
    operation: { type: String, required: true },
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    diff: { type: Schema.Types.Mixed }

  },{
    timestamps: true,
  })
  
const Log = mongoose.model('user', LogSchema)
module.exports = Log