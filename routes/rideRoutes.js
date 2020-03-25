const express = require('express')
const router = express.Router()
const rideController = require('../controllers/rideController.js')

// POSTs
router.post('/create', rideController.create)
router.post('/endRide', rideController.endRide)
router.post('/changeStatus', rideController.changeStatus)

module.exports = router
