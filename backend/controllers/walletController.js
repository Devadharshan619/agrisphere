const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendNotification } = require("../services/telegramService");

// Helper to get or create wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = new Wallet({ user: userId, balance: 0 });
    await wallet.save();
  }
  return wallet;
};

/**
 * @desc    Simulated Deposit (Simulates Razorpay Flow)
 * @route   POST /api/wallet/deposit
 */
exports.simulatedDeposit = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const wallet = await getOrCreateWallet(userId);

    // Create a transaction record
    const transaction = new Transaction({
      wallet: wallet._id,
      type: "deposit",
      amount: amount,
      status: "completed",
      referenceId: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: `Simulated Deposit via ${paymentMethod || 'Digital Bank'}`
    });

    await transaction.save();

    // Update Wallet Balance
    wallet.balance += Number(amount);
    await wallet.save();

    // Telegram Notification
    await sendNotification(userId, `💰 *Deposit Successful!* \nAmount: *₹${amount.toLocaleString()}*\nMethod: ${paymentMethod || 'Digital Bank'}`);

    res.status(200).json({
      success: true,
      message: "Funds deposited successfully",
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    console.error("Simulated deposit error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Simulated Withdrawal
 * @route   POST /api/wallet/withdraw
 */
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    const userId = req.user.id;

    const wallet = await getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    const transaction = new Transaction({
      wallet: wallet._id,
      type: "withdrawal",
      amount: amount,
      status: "completed",
      referenceId: `WIT-${Date.now()}`,
      description: `Withdrawal to ${bankAccount || 'Linked Bank Account'}`
    });

    await transaction.save();

    wallet.balance -= Number(amount);
    await wallet.save();

    // Telegram Notification
    await sendNotification(userId, `💸 *Withdrawal Processed* \nAmount: *₹${amount.toLocaleString()}*\nAccount: ${bankAccount || 'Linked Bank Account'}`);

    res.status(200).json({
      success: true,
      message: "Withdrawal processed",
      balance: wallet.balance,
      transaction
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    P2P Transfer
 * @route   POST /api/wallet/transfer
 */
exports.p2pTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { receiverEmail, amount, note } = req.body;
        const senderId = req.user.id;

        const senderWallet = await getOrCreateWallet(senderId);
        
        if (senderWallet.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Insufficient funds" });
        }

        const receiverUser = await User.findOne({ email: receiverEmail });
        if (!receiverUser) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Receiver not found" });
        }

        if (receiverUser._id.toString() === senderId) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Cannot transfer to yourself" });
        }

        const receiverWallet = await getOrCreateWallet(receiverUser._id);

        // Deduct from sender
        senderWallet.balance -= Number(amount);
        await senderWallet.save({ session });

        // Add to receiver
        receiverWallet.balance += Number(amount);
        await receiverWallet.save({ session });

        // Record for sender
        const senderTx = new Transaction({
            wallet: senderWallet._id,
            receiverWallet: receiverWallet._id,
            type: "transfer_out",
            amount: amount,
            status: "completed",
            description: note || `Transfer to ${receiverUser.name}`
        });
        await senderTx.save({ session });

        // Record for receiver
        const receiverTx = new Transaction({
            wallet: receiverWallet._id,
            type: "transfer_in",
            amount: amount,
            status: "completed",
            description: `Received from ${req.user.name}`
        });
        await receiverTx.save({ session });

        await session.commitTransaction();

        // Telegram Notifications
        await sendNotification(senderId, `📤 *Transfer Sent* \nTo: ${receiverUser.name}\nAmount: *₹${amount.toLocaleString()}*`);
        await sendNotification(receiverUser._id, `📥 *Transfer Received* \nFrom: ${req.user.name}\nAmount: *₹${amount.toLocaleString()}*`);

        res.status(200).json({ success: true, message: "Transfer successful", balance: senderWallet.balance });
    } catch (error) {
        await session.abortTransaction();
        console.error("Transfer error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        session.endSession();
    }
};

/**
 * @desc    Get Wallet Balance and History
 * @route   GET /api/wallet/info
 */
exports.getWalletInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await getOrCreateWallet(userId);
        
        const history = await Transaction.find({ wallet: wallet._id })
            .sort({ createdAt: -1 })
            .populate('receiverWallet', 'user')
            .limit(50);

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
