const Loan = require("../models/Loan");

// Farmer applies for a loan
exports.applyForLoan = async (req, res) => {
  try {
    const { farmId, amountRequested, purpose, creditScoreAtApplication } = req.body;
    
    const loan = new Loan({
      farmerId: req.user.id,
      farmId,
      amountRequested,
      purpose,
      creditScoreAtApplication
    });

    await loan.save();
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Bank views all pending loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find({}).populate("farmerId", "name email").populate("farmId", "farmName area cropType");
    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Farmer views their own loans
exports.getMyLoans = async (req, res) => {
    try {
      const loans = await Loan.find({ farmerId: req.user.id }).populate("farmId", "farmName");
      res.status(200).json({ success: true, data: loans });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Bank evaluates/updates a loan
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status, bankNotes } = req.body;
    
    // Admin or Bank can update status
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: "Loan not found" });

    loan.status = status || loan.status;
    loan.bankNotes = bankNotes || loan.bankNotes;

    await loan.save();

    // If approved, in a real system we would add funds to farmer's wallet here.
    if(status === "approved") {
        const Wallet = require("../models/Wallet");
        const Transaction = require("../models/Transaction");
        let wallet = await Wallet.findOne({ user: loan.farmerId });
        if(!wallet) wallet = new Wallet({ user: loan.farmerId, balance: 0});
        
        wallet.balance += loan.amountRequested;
        await wallet.save();
        
        await Transaction.create({
            wallet: wallet._id,
            type: "received",
            amount: loan.amountRequested,
            status: "completed",
            description: `Bank Loan Approved for ${loan.purpose || 'Farm'}`
        });
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
