const Auction = require("../models/Auction");
const { sendNotification } = require("../services/telegramService");

exports.createAuction = async (req, res) => {
  try {
    const { farmId, cropName, quantity, startingBid, startTime, endTime } = req.body;
    
    if (!farmId) {
      return res.status(400).json({ success: false, message: "A registered farm is required to start an auction." });
    }

    const auction = new Auction({
      farmerId: req.user.id,
      farmId,
      cropName,
      quantity,
      startingBid,
      currentHighestBid: startingBid,
      startTime,
      endTime
    });

    await auction.save();
    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    console.error("Auction Create Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: { $in: ["upcoming", "active"] } }).populate("farmerId", "name").populate("highestBidderId", "name");
    res.status(200).json({ success: true, data: auctions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    if (auction.status !== "active") return res.status(400).json({ success: false, message: "Auction is not active" });
    if (bidAmount <= auction.currentHighestBid) return res.status(400).json({ success: false, message: "Bid must be higher than current highest bid" });

    // In a real system we would lock funds in wallet here.
    const oldHighestBidderId = auction.highestBidderId;
    
    auction.currentHighestBid = bidAmount;
    auction.highestBidderId = req.user.id;
    await auction.save();

    // Telegram Notifications
    // 1. Notify the Farmer
    await sendNotification(
      auction.farmerId,
      `New bid of *₹${bidAmount}* placed on your auction for *${auction.cropName}*!`
    );

    // 2. Notify the previous highest bidder (if someone else)
    if (oldHighestBidderId && oldHighestBidderId.toString() !== req.user.id) {
      await sendNotification(
        oldHighestBidderId,
        `You have been outbid on *${auction.cropName}*. New high bid: *₹${bidAmount}*.`
      );
    }

    // Emit socket event for real-time update
    req.io.to(auction._id.toString()).emit("newBid", {
      auctionId: auction._id,
      currentHighestBid: bidAmount,
      highestBidderId: req.user.id
    });

    res.status(200).json({ success: true, message: "Bid placed successfully", data: auction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
