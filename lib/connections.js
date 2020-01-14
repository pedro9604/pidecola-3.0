'use strict'

const Conf = require('../Conf.js')
const Mongoose = require('mongoose')

const config = Conf.connections

exports.ENV = Conf.ENV
exports.SERVER_PORT = Conf.SERVER_PORT

const connections = {}

exports.connectDB = () => {
  const options = { 
    useUnifiedTopology: true, 
    useNewUrlParser: true 
  }
  
  Mongoose.connect(config[this.ENV].db, options, (err) => {
    if(err){
      console.log(`Error opened the database ${this.ENV}`, err)
      throw err
    }
    console.log(`successfully opened the database ${this.ENV}`) 
    connections.db = Mongoose.connection
  })
}
