'use strict'

// Server port
exports.SERVER_PORT = 5000

// Environment to use
exports.ENV = 'dev'

exports.connections = {
  dev: {
    db: 'mongodb://PideCola:pidecola2020@cluster-pide-cola-shard-00-00-z0k4t.gcp.mongodb.net:27017,cluster-pide-cola-shard-00-01-z0k4t.gcp.mongodb.net:27017,cluster-pide-cola-shard-00-02-z0k4t.gcp.mongodb.net:27017/pide_cola_dev?ssl=true&replicaSet=cluster-pide-cola-shard-0&authSource=admin&retryWrites=true&w=majority'

  }

}
