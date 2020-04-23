const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  bio: {
    type: String,
    default: "This user has no bio"
  },
});

module.exports = mongoose.model("Users", usersSchema);