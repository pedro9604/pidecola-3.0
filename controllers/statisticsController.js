const rides = require('../models/rideModel.js')
const response = require('../lib/utils/response').response

exports.getRidesGiven = (req, res) => {
    const email = req.secret.email
    if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
    rides.countDocuments({ rider: email }, function(err, result){
        if (err) return res.status(400).send(response(false, err, 'Error en la consulta'))
        else {
            return res.status(200).send(response(true, result, 'Numero de Colas Dadas'))
        }
    })
}

exports.getRidesReceived = (req, res) => {
    const email = req.secret.email
    if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
    rides.countDocuments({ passenger: email }, function(err, result){
        if (err) return res.status(400).send(response(false, err, 'Error en la consulta'))
        else {
            return res.status(200).send(response(true, result, 'Numero de Colas Recibidas'))
        }
    })
}

exports.getLikesCount = (req, res) => {
    const email = req.secret.email
    if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
    rides.countDocuments({ rider: email, "comments.like": true }, function(err, result){
        if (err) return res.status(400).send(response(false, err, 'Error en la consulta'))
        else {
            return res.status(200).send(response(true, result, 'Numero de Likes Recibidos'))
        }
    })
}

exports.getDislikesCount = (req, res) => {
    const email = req.secret.email
    if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
    rides.countDocuments({ rider: email, "comments.dislike": true }, function(err, result){
        if (err) return res.status(400).send(response(false, err, 'Error en la consulta'))
        else {
            return res.status(200).send(response(true, result, 'Numero de Dislikes Recibidos'))
        }
    })
}

