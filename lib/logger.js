const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'app.log',
      maxsize: 16 * 1024 * 1024,
      maxFiles: 2,
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} user: ${info.user} operation: ${info.operation} status: ${info.status}`
        ),
        winston.format.printf(
          error => `${error.timestamp} ${error.level}: ${error.message} user: ${error.user} operation: ${error.operation} status: ${error.status}`
        )
      )
    }),
  ]
})

module.exports = logger