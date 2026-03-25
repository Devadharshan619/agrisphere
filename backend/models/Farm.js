const mongoose = require("mongoose")

const FarmSchema = new mongoose.Schema({

  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  farmName: {
    type: String,
    required: true
  },

  district: {
    type: String,
    default: "Madurai"
  },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  
  boundaries: {
    type: { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: true } // Array of arrays of [lng, lat]
  },

  cropType: {
    type: String
  },

  area: {
    type: Number
  },

  soilType: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}).index({ farmerId: 1 });

module.exports = mongoose.model("Farm", FarmSchema)