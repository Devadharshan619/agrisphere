const CropListing = require("../models/CropListing");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

exports.createListing = async (req, res) => {
  try {
    const { farmId, cropName, quantity, qualityGrade, pricePerUnit, harvestDate } = req.body;
    
    const listing = new CropListing({
      farmerId: req.user.id,
      farmId,
      cropName,
      quantity,
      qualityGrade,
      pricePerUnit,
      harvestDate
    });

    await listing.save();
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await CropListing.find({ status: "available" }).populate("farmerId", "name").populate("farmId", "location boundaries farmName");
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.buyCrop = async (req, res) => {
  try {
    const { listingId, quantityToBuy } = req.body;
    const listing = await CropListing.findById(listingId);

    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    if (listing.status !== "available") return res.status(400).json({ success: false, message: "Crop not available" });
    if (quantityToBuy > listing.quantity) return res.status(400).json({ success: false, message: "Not enough quantity" });

    const totalCost = quantityToBuy * listing.pricePerUnit;
    const buyerWallet = await Wallet.findOne({ user: req.user.id });
    
    if (!buyerWallet || buyerWallet.balance < totalCost) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance. Please deposit funds." });
    }

    // Deduct from buyer
    buyerWallet.balance -= totalCost;
    await buyerWallet.save();

    // Create Buyer tx
    await Transaction.create({
      wallet: buyerWallet._id,
      type: "payment",
      amount: totalCost,
      status: "completed",
      description: `Bought ${quantityToBuy} units of ${listing.cropName}`
    });

    // Add to seller 
    let sellerWallet = await Wallet.findOne({ user: listing.farmerId });
    if (!sellerWallet) {
       sellerWallet = new Wallet({ user: listing.farmerId, balance: 0 });
    }
    sellerWallet.balance += totalCost;
    await sellerWallet.save();

    // Create Seller tx
    await Transaction.create({
      wallet: sellerWallet._id,
      type: "received",
      amount: totalCost,
      status: "completed",
      description: `Sold ${quantityToBuy} units of ${listing.cropName}`
    });

    // Update listing
    listing.quantity -= quantityToBuy;
    if (listing.quantity === 0) {
      listing.status = "sold";
    }
    await listing.save();

    res.status(200).json({ success: true, message: "Purchase successful", remainingBalance: buyerWallet.balance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
