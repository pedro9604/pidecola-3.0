'use strict'

const Mongoose = require('mongoose')
const chalk = require('chalk')
const Conf = require('../Config.js')
const redis = require("redis")
const bluebird = require("bluebird")
const config = Conf.connections

exports.ENV = Conf.ENV
exports.SERVER_PORT = Conf.SERVER_PORT

const connections = {}

exports.connectDB = () => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
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

exports.connectREDIS = async () => {
  const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { auth_pass: process.env.REDIS_KEY, tls: { servername: process.env.REDIS_HOST } })
  bluebird.promisifyAll(redis.RedisClient.prototype)
  bluebird.promisifyAll(redis.Multi.prototype)
  // Simple PING command
  console.log("\nCache command: PING");
  console.log("Cache response : " + await cacheConnection.pingAsync());
  // Simple get and put of integral data types into the cache
  console.log("\nCache command: GET Message");
  console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

  console.log("\nCache command: SET Message");
  console.log("Cache response : " + await cacheConnection.setAsync("Message",
      "Hello! The cache is working from Node.js!"));    

  // Demonstrate "SET Message" executed as expected...
  console.log("\nCache command: GET Message");
  console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

  // Get the client list, useful to see if connection list is growing...
  console.log("\nCache command: CLIENT LIST");
  console.log("Cache response : " + await cacheConnection.clientAsync("LIST"));    
  return client
}
