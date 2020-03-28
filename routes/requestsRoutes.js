const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController.js')

// POSTs
router.post('/create', requestsController.create)
router.post('/cancel', requestsController.cancel)
router.post('/updateStatus', requestsController.updateStatus)
router.post('/offerRide', requestsController.offerRide)
router.post('/respondOfferRide', requestsController.respondOfferRide)

module.exports = router
