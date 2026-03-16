const Auction = require("../models/Auction");

exports.createAuction = async (req, res) => {
  try {
    const { farmId, cropName, quantity, startingBid, startTime, endTime } = req.body;
    
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
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
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
    auction.currentHighestBid = bidAmount;
    auction.highestBidderId = req.user.id;
    await auction.save();

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
