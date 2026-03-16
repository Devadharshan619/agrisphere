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

  location: {
    lat: Number,
    lng: Number
  },
  
  boundaries: {
    type: [[Number]], // Array of [lng, lat] for Mapbox/Leaflet polygons
    default: []
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

})

module.exports = mongoose.model("Farm", FarmSchema)