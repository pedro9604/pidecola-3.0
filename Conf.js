'use strict'

// Server port
exports.SERVER_PORT = 2222

// Environment to use
exports.ENV = 'dev'

exports.connections = {
  dev: {
    db: 'mongodb://localhost:27017/pide_cola_dev'
  }

}
