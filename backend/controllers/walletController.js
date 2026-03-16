const Razorpay = require("razorpay");
const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
require("dotenv").config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

// Helper to get or create wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = new Wallet({ user: userId, balance: 0 });
    await wallet.save();
  }
  return wallet;
};

// 1. Create an order for a deposit
exports.createDepositOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR rupees
    const userId = req.user.id; // From auth middleware

    const wallet = await getOrCreateWallet(userId);

    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_wallet_${wallet._id}_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    // Create a pending transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      type: "deposit",
      amount: amount,
      status: "pending",
      referenceId: order.id,
      description: "Wallet Deposit Initiation"
    });
    await transaction.save();

    res.status(200).json({
      success: true,
      order,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Verify Razorpay Payment Signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

    // Generate expected signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

      if (transaction.status === "completed") {
         return res.status(400).json({ success: false, message: "Transaction already processed" });
      }

      transaction.status = "completed";
      transaction.referenceId = razorpay_payment_id;
      transaction.description = "Wallet Deposit Successful";
      await transaction.save();

      // Update wallet balance
      const wallet = await Wallet.findById(transaction.wallet);
      wallet.balance += transaction.amount;
      await wallet.save();

      res.status(200).json({ success: true, message: "Payment verified successfully", balance: wallet.balance });
    } else {
       // Payment verification failed
       const transaction = await Transaction.findById(transactionId);
       if (transaction) {
         transaction.status = "failed";
         await transaction.save();
       }
       res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Get Wallet Balance and History
exports.getWalletInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await getOrCreateWallet(userId);
        
        const history = await Transaction.find({ wallet: wallet._id }).sort({ createdAt: -1 }).limit(20);

        res.status(200).json({
            success: true,
            balance: wallet.balance,
            currency: wallet.currency,
            history
        });
    } catch(error) {
        console.error("Get wallet info error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}
