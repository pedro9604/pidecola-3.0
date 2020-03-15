const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')

// POSTs
router.post('/', userController.create)

//PUTs
router.put('/addVehicle', userController.addVehicle)

module.exports = router
