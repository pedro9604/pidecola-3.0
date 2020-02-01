const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const rideController = require('../controllers/rideController.js')

// POSTs
router.post('/', userController.create)
router.post('/', rideController.create)

module.exports = router
