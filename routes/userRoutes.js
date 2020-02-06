const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const rideController = require('../controllers/rideController.js')

// POSTs
router.post('/', rideController.create)
router.post('/', userController.create)

module.exports = router
