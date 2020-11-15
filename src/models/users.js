const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("users", usersSchema);
