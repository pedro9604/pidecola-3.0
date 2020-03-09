const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController.js')

// POSTs
router.post('/', userController.create)
router.put('/updateProfile', userController.updateUser)

module.exports = router
