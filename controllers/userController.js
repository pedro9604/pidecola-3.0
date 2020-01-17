const users = require('../models/userModel.js')

exports.create = (req, res) => {
  users.create(req.body)
    .then((usr) => {
      return res.status(200).send(usr)
    })
    .catch(err => {
      return res.status(500).send(err)
    })
}
