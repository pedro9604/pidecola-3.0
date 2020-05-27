const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController.js')

// GETs
router.get('/get', requestsController.getRequest)

// POSTs
router.post('/create', requestsController.create)
router.post('/cancel', requestsController.cancel)
router.post('/updateStatus', requestsController.updateStatus)
router.post('/offerRide', requestsController.offerRide)
router.post('/respondOfferRide', requestsController.respondOfferRide)
router.post('/review/offers', requestsController.reviewOffers)

module.exports = router
