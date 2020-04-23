const mongoose = require("mongoose");

const botsSchema = new mongoose.Schema({
  addedAt: {
    default: () => new Date(),
    type: Date
  },
  username: {
    type: String,
    required: true
  },
  botid: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    required: true
  },
  invite: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  long: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  state:  {
    type: String,
    required: true,
    default: "unverified"
  },
  owners: {
      type: Array,
      required: true
  },
  auth: {
    type: String
  },
  servers: [
    {
      time: {
        type: Date,
        default: () => Date.now()
      },
      servers: {
        type: Number,
        default: 0
      }
    }
  ],
  nsfw: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Bots", botsSchema);