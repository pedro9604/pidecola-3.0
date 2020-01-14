'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const config = require('./Conf.js')
const connections = require('./lib/connections.js')

connections.connectDB()

const app = express()
const port = config.ENV || 2222

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const user = require('./routes/userRoutes.js');
app.use('/users', user);

app.listen(3005, () => {
  console.log(`PIDE COLA USB 3.0 \n running in port ${port}`)
})
