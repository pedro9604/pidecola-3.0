const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController.js')

// POSTs
router.post('/', requestsController.create)

module.exports = router