const express = require("express");
const User = require("../models/User");
const Farm = require("../models/Farm");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    const farmerCount = await User.countDocuments({ role: "farmer" });
    const traderCount = await User.countDocuments({ role: "trader" });
    const farmCount = await Farm.countDocuments();
    
    // Calculate total market volume from completed marketplace transactions
    const transactions = await Transaction.find({ type: "marketplace_payment", status: "completed" });
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalFarmers: farmerCount,
        totalTraders: traderCount,
        totalFarms: farmCount,
        marketVolume: totalVolume
      }
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/momentum", protect, async (req, res) => {
  try {
    const crops = ["Wheat", "Rice", "Corn", "Soybean", "Sugar"];
    const momentum = await Promise.all(crops.map(async (crop) => {
      const recentListings = await Transaction.find({ 
        description: { $regex: crop, $options: "i" },
        status: "completed"
      }).sort({ createdAt: -1 }).limit(10);
      
      const change = (Math.random() * 5).toFixed(1);
      const isUp = Math.random() > 0.3;
      
      return {
        name: crop.toUpperCase(),
        change: isUp ? `+${change}%` : `-${change}%`,
        isUp
      };
    }));

    res.status(200).json({ success: true, data: momentum });
  } catch (error) {
    console.error("Momentum fetch error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
