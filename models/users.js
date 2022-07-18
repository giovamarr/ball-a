const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    created: { type: Date, default: Date.now },
})

const User = mongoose.model('users' ,userSchema )
module.exports = User