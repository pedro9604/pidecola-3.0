'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const chalk = require('chalk')

const config = require('./Conf.js')
const connections = require('./lib/connections.js')

connections.connectDB()

const app = express()
const port = config.SERVER_PORT || 2222

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const user = require('./routes/userRoutes.js')
app.use('/users', user)

app.listen(port, () => {
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
