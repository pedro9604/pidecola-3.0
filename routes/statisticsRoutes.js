const express = require('express')
const router = express.Router()
const statisticsController = require('../controllers/statisticsController.js')

router.get('/rides/given', statisticsController.getRidesGiven)
router.get('/rides/received', statisticsController.getRidesReceived)
router.get('/count/likes', statisticsController.getLikesCount)
router.get('/count/dislikes', statisticsController.getDislikesCount)

module.exports = router