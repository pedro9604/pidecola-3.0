const express = require('express')
const router = express.Router()
const rideController = require('../controllers/rideController.js')

// POSTs
router.post('/', rideController.create)

module.exports = router
