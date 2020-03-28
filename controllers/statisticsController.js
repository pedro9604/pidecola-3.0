const rides = require('../models/rideModel.js')


const countLikes = (email) => {
    return rides.countDocuments({ rider: email, comments: {like: 1} })
}

const countDislikes = (email) => {
    return rides.countDocuments({ rider: email, comments: {dislike: 1} })
}

exports.getStatistics = (req, res) => {
    const email = req.secret.email
    if (!email) return res.status(401).send(response(false, '', 'El Email es necesario.'))
    console.log(countLikes(email))
    console.log(countDislikes(email))
    res.status(200).send(response(true, null, 'Estadisticas'))
}
