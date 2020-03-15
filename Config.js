'use strict'

// Server port
exports.SERVER_PORT = 5000

// Environment to use
exports.ENV = 'dev'

// Cloudinary
exports.CLOUD_NAME = 'dcmr7dmyu'
exports.API_KEY = '699473156776729'
exports.API_SECRET = 'Ip3M4Jup6IIh4F3cLT3IzJ9stQY'

exports.connections = {
  dev: {
    db: 'mongodb://PideCola:pidecola2020@cluster-pide-cola-shard-00-00-z0k4t.gcp.mongodb.net:27017,cluster-pide-cola-shard-00-01-z0k4t.gcp.mongodb.net:27017,cluster-pide-cola-shard-00-02-z0k4t.gcp.mongodb.net:27017/pide_cola_dev?ssl=true&replicaSet=cluster-pide-cola-shard-0&authSource=admin&retryWrites=true&w=majority'

  }

}
