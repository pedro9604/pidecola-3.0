const multer = require('multer')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary')
const staticPath = './temporal'
const folder = path.join(__dirname, `../temporal/`);

const createLocalFolder = folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder)
}
createLocalFolder(folder)

exports.cloudinaryConfig = () => cloudinary.config({

  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET

})

const storageEngine = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, staticPath)
  },
  filename: function(req, file, callback) {
    callback(null, `${moment().format('YYYYMMDDmmss')}-${file.originalname}`)
  }
})

exports.upload = multer({ storage: storageEngine, })

exports.uploadFile = (path) => {
  return new Promise((resolve, rejecte) => {
    cloudinary.uploader.upload(path, (picture, err) => {
      fs.unlinkSync(path)
      if (!picture || err) return rejecte(false)
      return resolve(picture)
    })
  })
}
