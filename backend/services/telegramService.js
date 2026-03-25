const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Wallet = require('../models/Wallet');
const CropListing = require('../models/CropListing');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;

if (token) {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to AgriSphere Bot! 🌾\n\nCommands:\n/myfarms - List your farms\n/wallet - Check balance\n/market - Top listings\n/loanstatus - Recent applications\n/alerts - Recent notifications\n\nPlease reply with your registered email to link your account if not done.");
  });

  // Handle /myfarms
  bot.onText(/\/myfarms/, async (msg) => {
    try {
      const user = await User.findOne({ telegramChatId: msg.chat.id });
      if (!user) return bot.sendMessage(msg.chat.id, "Please link your account first by sending your email.");
      
      const farms = await Farm.find({ farmerId: user._id });
      if (farms.length === 0) return bot.sendMessage(msg.chat.id, "You have no farms registered.");
      
      let res = "🚜 *Your Registered Farms:*\n\n";
      farms.forEach((f, i) => {
        res += `${i+1}. *${f.farmName}*\nType: ${f.cropType}\nArea: ${f.area} Ha\nStatus: Online\n\n`;
      });
      bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Error fetching farms.");
    }
  });

  // Handle /wallet
  bot.onText(/\/wallet/, async (msg) => {
    try {
      const user = await User.findOne({ telegramChatId: msg.chat.id });
      if (!user) return bot.sendMessage(msg.chat.id, "Please link your account first.");
      
      const wallet = await Wallet.findOne({ user: user._id });
      bot.sendMessage(msg.chat.id, `💰 *Wallet Balance:*\n\nAvailable: *₹${wallet?.balance || 0}*\nCurrency: INR`, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Error fetching wallet.");
    }
  });

  // Handle /market
  bot.onText(/\/market/, async (msg) => {
    try {
      const listings = await CropListing.find({ status: 'available' }).limit(5);
      if (listings.length === 0) return bot.sendMessage(msg.chat.id, "No active listings in the market.");
      
      let res = "🛒 *Top Marketplace Listings:*\n\n";
      listings.forEach((l, i) => {
        res += `${i+1}. *${l.cropName}* - ₹${l.pricePerUnit}/ton\nQty: ${l.quantity} units\n\n`;
      });
      bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Error fetching market.");
    }
  });

  // Handle /loanstatus
  bot.onText(/\/loanstatus/, async (msg) => {
    try {
      const user = await User.findOne({ telegramChatId: msg.chat.id });
      if (!user) return bot.sendMessage(msg.chat.id, "Please link your account first.");
      
      const Loan = require('../models/Loan');
      const loans = await Loan.find({ farmerId: user._id }).sort({ createdAt: -1 }).limit(3);
      if (loans.length === 0) return bot.sendMessage(msg.chat.id, "No loan applications found.");
      
      let res = "🏦 *Your Loan Status:* \n\n";
      loans.forEach((l, i) => {
        res += `${i+1}. *₹${l.amountRequested.toLocaleString()}*\nStatus: ${l.status.toUpperCase()}\nPurpose: ${l.purpose}\n\n`;
      });
      bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Error fetching loan status.");
    }
  });

  // Handle /alerts
  bot.onText(/\/alerts/, async (msg) => {
    try {
      const user = await User.findOne({ telegramChatId: msg.chat.id });
      if (!user) return bot.sendMessage(msg.chat.id, "Please link your account first.");
      
      const Notification = require('../models/Notification');
      const alerts = await Notification.find({ recipient: user._id }).sort({ createdAt: -1 }).limit(5);
      if (alerts.length === 0) return bot.sendMessage(msg.chat.id, "No recent alerts.");
      
      let res = "🔔 *Recent Alerts:*\n\n";
      alerts.forEach((a, i) => {
        res += `• ${a.message} (${new Date(a.createdAt).toLocaleDateString()})\n\n`;
      });
      bot.sendMessage(msg.chat.id, res, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(msg.chat.id, "Error fetching alerts.");
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.includes('@') && !text.startsWith('/')) {
      try {
        const user = await User.findOne({ email: text.toLowerCase() });
        if (user) {
          user.telegramChatId = chatId;
          await user.save();
          bot.sendMessage(chatId, `✅ Successfully linked! Welcome ${user.name}. You will now receive alerts.`);
        } else {
          bot.sendMessage(chatId, "❌ Email not found in AgriSphere records.");
        }
      } catch (err) {
        console.error("Telegram link error:", err);
      }
    }
  });

  console.log('Telegram Bot service initialized with advanced commands.');
} else {
  console.warn('TELEGRAM_BOT_TOKEN not found in env.');
}

const sendNotification = async (userId, message) => {
  if (!bot) return;
  try {
    const user = await User.findById(userId);
    if (user && user.telegramChatId) {
      await bot.sendMessage(user.telegramChatId, `🔔 *AgriSphere Alert* 🔔\n\n${message}`, { parse_mode: 'Markdown' });
    }
  } catch (err) {
    console.error("Telegram notify error:", err);
  }
};

module.exports = { sendNotification };
