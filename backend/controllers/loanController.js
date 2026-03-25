// backend/controllers/loanController.js
const axios = require('axios');
const Loan = require('../models/Loan');
const User = require('../models/User');
const { sendNotification } = require('../services/telegramService');

// 1. Apply for a new loan (Our AI Integration)
exports.applyForLoan = async (req, res) => {
  try {
    const { requestedAmount, farmId, annualIncome, farmSizeAcres, previousDefaults, avgYieldValue } = req.body;
    
    // Call the Python AI Service to get the credit score
    const aiResponse = await axios.post('http://localhost:8000/credit-score', {
      farmer_id: req.user.id || req.user._id,
      annual_income: annualIncome || 0,
      farm_size_acres: farmSizeAcres || 0,
      previous_loan_defaults: previousDefaults || 0,
      average_yearly_yield_value: avgYieldValue || 0
    });

    const creditData = aiResponse.data;

    // Save the Loan Application in MongoDB with the AI's decision
    const newLoan = new Loan({
      farmerId: req.user.id || req.user._id,
      farmId: farmId, // Collateral plot
      amountRequested: requestedAmount,
      purpose: req.body.purpose || "Agricultural Expansion",
      aiCreditScore: creditData.credit_score,
      riskCategory: creditData.risk_category,
      status: creditData.loan_eligibility === 'Approved' ? 'Pre-Approved' : 'Pending Manual Review',
      recommendedMax: creditData.recommended_max_loan
    });

    await newLoan.save();

    // Telegram Notification
    await sendNotification(
      req.user.id || req.user._id,
      `Your loan application for ₹${requestedAmount} has been processed.\nStatus: *${newLoan.status}*\nAI Credit Score: *${newLoan.aiCreditScore}*`
    );

    res.status(201).json({ 
      success: true, 
      message: "Loan application processed via AI.",
      ai_insights: creditData,
      loan_record: newLoan
    });

  } catch (error) {
    console.error("AI Service Error:", error.message);
    res.status(500).json({ error: "Failed to process loan. Ensure AI service is running on port 8000." });
  }
};

// 2. Get all loans for the logged-in farmer (Likely what Line 8 in loanRoutes is looking for!)
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ farmerId: req.user.id || req.user._id })
      .populate('farmId', 'farmName area cropType')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error fetching loans" });
  }
};

// 3. Get a specific loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: "Loan not found" });
    }
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error fetching loan details" });
  }
};