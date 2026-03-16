const mongoose = require("mongoose");

const CropListingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true // e.g. in Tons or KG
  },
  qualityGrade: {
    type: String,
    enum: ["A", "B", "C"],
    default: "A"
  },
  pricePerUnit: {
    type: Number,
    required: true // in INR
  },
  status: {
    type: String,
    enum: ["available", "sold", "delisted"],
    default: "available"
  },
  harvestDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CropListing", CropListingSchema);
