'use strict'

const Mongoose = require('mongoose')
const chalk = require('chalk')
const Conf = require('../Conf.js')
const config = Conf.connections

exports.ENV = Conf.ENV
exports.SERVER_PORT = Conf.SERVER_PORT

const connections = {}

exports.connectDB = () => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  }

  Mongoose.connect(config[this.ENV].db, options, (err) => {
    if (err) {
      console.error(`Error opened the database ${this.ENV}`, err)
      throw err
    }
    console.log(chalk.green(`\nSuccessfully opened the database ${this.ENV}\n`))
    connections.db = Mongoose.connection
  })
}
