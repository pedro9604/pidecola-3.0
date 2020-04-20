const express = require('express')
const router = express.Router()
const rideController = require('../controllers/rideController.js')

// GETs
router.get('/get', rideController.getRide)

// POSTs
router.post('/create', rideController.create)
router.post('/cancel', rideController.cancel)

// PUTs
router.put('/endRide', rideController.endRide)
router.put('/changeStatus', rideController.changeStatus)
router.put('/commentARide', rideController.commentARide)

module.exports = router
