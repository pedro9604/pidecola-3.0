'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogSchema = new Schema(
  {
    operation: { type: String, required: true },
    collection_name: { type: String, required: true },
    user: { type: String, ref: 'User' },
    message: { type: String }

  }, {
    timestamps: true
  })

const Log = mongoose.model('log', LogSchema)
module.exports = Log
