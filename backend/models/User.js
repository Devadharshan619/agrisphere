const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["farmer", "trader", "bank", "admin", "superadmin"],
    required: true,
  },
  phone: {
    type: String,
    default: ""
  },
  district: {
    type: String,
    default: "Madurai"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  telegramChatId: {
    type: String,
    default: null,
    index: true
  },
  telegramNumber: {
    type: String,
    default: ""
  },
}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)