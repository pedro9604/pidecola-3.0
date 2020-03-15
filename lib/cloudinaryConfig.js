const multer = require('multer')
const cloudinary = require('cloudinary').config
const config = require('../Config.js')
const path
exports.cloudinaryConfig = () => cloudinary({

  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET

})

const storageEngine = multer.diskStorage({

  filename: function (req, file, callback) {
    callback(null, new Date().getTime().toString() + '-' + file.fieldname + path.extname(file.originalname))
  }

})

exports.upload = multer({

  storage: storageEngine,
  limits: { fileSize: 200000 },
  fileFilter: function (req, file, callback) {
    validateFile(file, callback)
  }

}).single('image')

const validateFile = function (file, callback) {
  const allowedFileTypes = /jpg|png/
  const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeType = allowedFileTypes.test(file.mimetype)
  if (extension && mimeType) {
    return callback(null, true)
  } else {
    callback('Invalid file type')
  }
}
