'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const cors = require('cors')
const http = require('http')

const config = require('./Config.js')
const connections = require('./lib/connections.js')
const cloudinary = require('./lib/cloudinaryConfig.js')

connections.connectDB()
cloudinary.cloudinaryConfig()

const app = express()
app.disable('x-powered-by')
const port = process.env.PORT || config.SERVER_PORT || 5000

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cors())

const autentication = require('./autentication.js')
app.use('/login', autentication.signIn)

// Default security for all endpoints
app.use(autentication.verifyAutentication)

const user = require('./routes/userRoutes.js')
app.use('/users', user)

const ride = require('./routes/rideRoutes.js')
app.use('/rides', ride)

const requests = require('./routes/requestsRoutes.js')
app.use('/requests', requests)

const algorithm = require('./routes/algorithmRoutes.js')
app.use('/recommend', algorithm)

const server = http.createServer(app);

server.listen(port, () => {
  console.log(chalk.blue(`
   _______  ___  ______  ______ 
  |   __  ||   ||      ||   ___|
  |  |  | ||   ||  __  ||  |
  |  |__| ||   || |  | ||  |___ 
  |   ____||   || |  | ||   ___|
  |  |     |   || |__| ||  | 
  |  |     |   ||      ||  |___ 
  |__|     |___||______||______|
  `),
  chalk.yellow(` 
 _______  _______  _      _______  _______       ______ 
|   ____||       || |    |       ||___    |     |      |
|  |     |   _   || |    |   _   |    |   |     |  __  |
|  |     |  | |  || |    |  | |  | ___|   |     | |  | |
|  |     |  | |  || |    |  |_|  ||___    |     | |  | |
|  |     |  |_|  || |    |       |    |   | ___ | |__| |
|  |____ |       || |___ |   _   | ___|   ||   ||      |
|_______||_______||_____||__| |__||_______||___||______|`))
  console.log(chalk.blue(`\nRunning in port ${port}`))
})
