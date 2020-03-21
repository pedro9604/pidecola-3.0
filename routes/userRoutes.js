const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const upload = require('../lib/cloudinaryConfig.js').upload

// GETs
router.get('/', userController.getUserInformation)

// POSTs
router.post('/', userController.create)
router.post('/code', userController.codeValidate)

// PUTs
router.put('/', userController.updateUser)
router.put('/add/vehicle', upload.single('file'), userController.addVehicle)

module.exports = router
