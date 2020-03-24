const express = require('express')
const router = express.Router()
const algorithmController = require('../controllers/algorithmController.js')

// POSTs
router.post('/', algorithmController.recommend)

module.exports = router