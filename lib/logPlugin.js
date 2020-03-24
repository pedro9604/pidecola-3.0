const LogSchema = require('../models/logModel.js')

const logPlugin = function (schema) {
      schema.methods.log = function (data)  {
        return LogSchema.create(data)
    }
  }
  
module.exports = logPlugin