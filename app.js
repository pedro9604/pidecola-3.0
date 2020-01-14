const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/pidecola', {
    useNewUrlParser: true})
const db = mongoose.connection
db.once("open", () => {
    console.log("> successfully opened the database")
})

