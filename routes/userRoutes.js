const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const rideController = require('../controllers/rideController.js')
const requestsController = require('../controllers/requestsController.js')
// POSTs
router.post('/', requestsController.create)
router.post('/', rideController.create)
router.post('/', userController.create)

module.exports = router
