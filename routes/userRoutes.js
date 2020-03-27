const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')
const upload = require('../lib/cloudinaryConfig.js').upload

// GETs
router.get('/view/profile', userController.getUserInformation)

// POSTs
router.post('/', userController.create)
router.post('/code', userController.codeValidate)

// PUTs
router.put('/view/profile', userController.updateUser)
router.put('/update/picture', upload.single('file'), userController.updateProfilePic)
router.put('/add/vehicle', upload.single('file'), userController.addVehicle)
router.put('/delete/vehicle', userController.deleteVehicle)

module.exports = router
