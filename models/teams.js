const mongoose = require('mongoose')
const teamSchema = new mongoose.Schema({
    name: String,
    founder: String,
    created: { type: Date, default: Date.now },
})

const Team = mongoose.model('teamSchema' ,teamSchema )
module.exports = Team