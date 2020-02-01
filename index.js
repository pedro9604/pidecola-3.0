'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const cors = require('cors');
const http = require('http');

const config = require('./Config.js')
const connections = require('./lib/connections.js')

connections.connectDB()

const app = express()
app.disable('x-powered-by')
const port = config.SERVER_PORT || 5000

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cors())

const autentication = require('./autentication.js')
app.use('/login', autentication.signIn)

const user = require('./routes/userRoutes.js')
app.use('/users', user)

const server = http.createServer(app);

server.listen(port, () => {
  console.log(chalk.blue(`
   _______  ___   ______   _______ 
  |       ||   | |      | |       |
  |    _  ||   | |  _    ||    ___|
  |   |_| ||   | | | |   ||   |___ 
  |    ___||   | | |_|   ||    ___|
  |   |    |   | |       ||   |___ 
  |___|    |___| |______| |_______|
  `),
  chalk.yellow(` 
 _______  _______  ___      _______  _______        _______ 
|       ||       ||   |    |   _   ||       |      |  _    |
|       ||   _   ||   |    |  |_|  ||___    |      | | |   |
|       ||  | |  ||   |    |       | ___|   |      | | |   |
|      _||  |_|  ||   |___ |       ||___    | ___  | |_|   |
|     |_ |       ||       ||   _   | ___|   ||   | |       |
|_______||_______||_______||__| |__||_______||___| |_______|`))
  console.log(chalk.blue(`\nRunning in port ${port}`))
})
