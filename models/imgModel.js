const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImgSchema = new Schema(
  {
    data: {type: Buffer, required: true},
    contentType: {type: String, required: true}
  }
);

const Img = mongoose.model('img', ImgSchema)
module.exports = Img