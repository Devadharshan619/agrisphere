const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Models
const User = require("../models/User");
const Farm = require("../models/Farm");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const CropListing = require("../models/CropListing");
const Auction = require("../models/Auction");
const Loan = require("../models/Loan");
const ActionRoom = require("../models/ActionRoom");
const ActionTask = require("../models/ActionTask");
const ActionDecision = require("../models/ActionDecision");
const Notification = require("../models/Notification");

const districts = [
  "Madurai", "Coimbatore", "Theni", "Erode", "Dindigul", 
  "Salem", "Tirunelveli", "Thoothukudi", "Karur", "Nilgiris"
];

const cropDatabase = {
  spices: [
    { name: "Cardamom", price: 1800, unit: "kg" },
    { name: "Turmeric", price: 140, unit: "kg" },
    { name: "Black Pepper", price: 620, unit: "kg" },
    { name: "Cloves", price: 950, unit: "kg" },
    { name: "Cinnamon", price: 400, unit: "kg" }
  ],
  plantation: [
    { name: "Coffee Beans", price: 480, unit: "kg" },
    { name: "Tea Leaves", price: 210, unit: "kg" }
  ],
  fruits: [
    { name: "Banana", price: 32, unit: "kg" },
    { name: "Mango", price: 85, unit: "kg" },
    { name: "Papaya", price: 40, unit: "kg" },
    { name: "Guava", price: 55, unit: "kg" },
    { name: "Pomegranate", price: 120, unit: "kg" }
  ],
  vegetables: [
    { name: "Tomato", price: 24, unit: "kg" },
    { name: "Onion", price: 35, unit: "kg" },
    { name: "Brinjal", price: 28, unit: "kg" },
    { name: "Chili", price: 70, unit: "kg" },
    { name: "Drumstick", price: 45, unit: "kg" },
    { name: "Potato", price: 22, unit: "kg" },
    { name: "Carrot", price: 38, unit: "kg" }
  ],
  flowers: [
    { name: "Jasmine", price: 350, unit: "kg" },
    { name: "Rose", price: 180, unit: "kg" },
    { name: "Marigold", price: 60, unit: "kg" },
    { name: "Lotus", price: 15, unit: "piece" },
    { name: "Chrysanthemum", price: 120, unit: "kg" }
  ]
};

const farmerNames = ["Ramesh Kumar", "Sathish Raj", "Arun Prakash", "Muthuvel Pandian", "Selvaraj", "Pandi", "Ganesh", "Subhash", "Murugan", "Karthik", "Velu", "Chinnasamy", "Periyasamy", "Anbu", "Bala", "Dinesh", "Elango", "Faizal", "Guru", "Hari"];
const traderNames = ["Vignesh Trade", "TN Exports", "Salem Spices", "Kongu Traders", "Cauvery Agros", "Bharath Corp", "Southern Markets", "Organic Hub", "Delta Merchants", "Tamil Tradelink"];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for high-fidelity seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await CropListing.deleteMany({});
    await Auction.deleteMany({});
    await Loan.deleteMany({});
    await ActionRoom.deleteMany({});
    await ActionTask.deleteMany({});
    await ActionDecision.deleteMany({});
    await Notification.deleteMany({});
    console.log("Existing data cleared.");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create Users
    console.log("Generating Users...");
    const users = [];

    // 20 Farmers
    for (let i = 0; i < 20; i++) {
      users.push({
        name: farmerNames[i] || `Farmer ${i+1}`,
        email: `farmer${i+1}@agrisphere.com`,
        password: hashedPassword,
        role: "farmer",
        phone: `+91 ${9000000000 + i}`,
        telegramNumber: `+91 ${9000000000 + i}`,
        district: districts[i % districts.length],
        isVerified: i % 3 === 0
      });
    }

    // 10 Traders
    for (let i = 0; i < 10; i++) {
        users.push({
          name: traderNames[i] || `Trader ${i+1}`,
          email: `trader${i+1}@agrisphere.com`,
          password: hashedPassword,
          role: "trader",
          phone: `+91 ${8000000000 + i}`,
          telegramNumber: `+91 ${8000000000 + i}`,
          district: districts[i % districts.length],
          isVerified: true
        });
      }

    // 3 Banks
    users.push({ 
      name: "SBI Agri Branch", 
      email: "sbi@agrisphere.com", 
      password: hashedPassword, 
      role: "bank", 
      phone: "1800-SBI-AGRI", 
      telegramNumber: "+91 7000000001",
      district: "Chennai", 
      isVerified: true 
    });
    users.push({ 
      name: "ICICI Rural", 
      email: "icici@agrisphere.com", 
      password: hashedPassword, 
      role: "bank", 
      phone: "1800-ICICI-RURAL", 
      telegramNumber: "+91 7000000002",
      district: "Coimbatore", 
      isVerified: true 
    });
    users.push({ 
      name: "HDFC Farmers First", 
      email: "hdfc@agrisphere.com", 
      password: hashedPassword, 
      role: "bank", 
      phone: "1800-HDFC-FARM", 
      telegramNumber: "+91 7000000003",
      district: "Madurai", 
      isVerified: true 
    });

    // 2 Admins
    users.push({ 
      name: "Admin One", 
      email: "admin@agrisphere.com", 
      password: hashedPassword, 
      role: "admin", 
      phone: "9999999999", 
      telegramNumber: "+91 9999999999",
      district: "AgriSphere HQ", 
      isVerified: true 
    });
    users.push({ 
      name: "Sathish (Super)", 
      email: "sathish@agrisphere.com", 
      password: hashedPassword, 
      role: "superadmin", 
      phone: "8888888888", 
      telegramNumber: "+91 8888888888",
      district: "Madurai", 
      isVerified: true 
    });

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} Users seeded.`);

    // 2. Create Wallets
    console.log("Generating Wallets...");
    const wallets = await Wallet.insertMany(createdUsers.map(u => ({
      user: u._id,
      balance: u.role === "trader" ? 100000 + Math.random() * 900000 : 
               u.role === "farmer" ? 5000 + Math.random() * 45000 : 5000000,
    })));
    console.log("Wallets seeded.");

    // 3. Create Farms
    console.log("Generating Farms...");
    const farmers = createdUsers.filter(u => u.role === "farmer");
    const farms = [];

    for (const farmer of farmers) {
      const numFarms = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numFarms; j++) {
        const district = farmer.district;
        farms.push({
          farmerId: farmer._id,
          farmName: `${farmer.name.split(' ')[0]}'s ${district} Estate`,
          district: district,
          location: { 
            type: "Point", 
            coordinates: [77 + Math.random() * 2, 10 + Math.random() * 2] 
          },
          boundaries: {
            type: "Polygon",
            coordinates: [[[77.2, 10.2], [77.3, 10.2], [77.3, 10.3], [77.2, 10.3], [77.2, 10.2]]]
          },
          cropType: Object.keys(cropDatabase)[Math.floor(Math.random() * Object.keys(cropDatabase).length)],
          area: 2 + Math.random() * 18,
          soilType: ["Alluvial", "Black Soil", "Red", "Clay", "Loamy"][Math.floor(Math.random() * 5)]
        });
      }
    }

    const createdFarms = await Farm.insertMany(farms);
    console.log(`${createdFarms.length} Farms seeded.`);

    // 4. Create Marketplace Listings
    console.log("Generating 50+ Listings...");
    const listings = [];
    const allCrops = Object.values(cropDatabase).flat();

    for (let i = 0; i < 60; i++) {
        const farmer = farmers[Math.floor(Math.random() * farmers.length)];
        const farm = createdFarms.find(f => f.farmerId.toString() === farmer._id.toString());
        const crop = allCrops[Math.floor(Math.random() * allCrops.length)];
        
        listings.push({
          farmerId: farmer._id,
          farmId: farm._id,
          cropName: crop.name,
          quantity: Math.floor(5 + Math.random() * 500),
          qualityGrade: ["A", "B", "C"][Math.floor(Math.random() * 3)],
          pricePerUnit: crop.price + (Math.random() * 10 - 5),
          status: i < 50 ? "available" : "sold",
          harvestDate: new Date(Date.now() - Math.random() * 1000000000)
        });
    }

    const createdListings = await CropListing.insertMany(listings);
    console.log(`${createdListings.length} Listings seeded.`);

    // 5. Create Live Auctions
    console.log("Generating 10 Auctions...");
    const auctions = [];
    for (let i = 0; i < 10; i++) {
      const farm = createdFarms[Math.floor(Math.random() * createdFarms.length)];
      const crop = allCrops[Math.floor(Math.random() * allCrops.length)];
      const startPrice = crop.price * 1000;

      auctions.push({
        farmerId: farm.farmerId,
        farmId: farm._id,
        cropName: `Premium ${crop.name} Bulk`,
        quantity: Math.floor(10 + Math.random() * 100),
        startingBid: startPrice,
        currentHighestBid: startPrice + Math.random() * 5000,
        status: i < 8 ? "active" : "upcoming",
        startTime: new Date(),
        endTime: new Date(Date.now() + 86400000 * 2)
      });
    }
    const createdAuctions = await Auction.insertMany(auctions);
    console.log(`${createdAuctions.length} Auctions seeded.`);

    // 6. Create Loans
    console.log("Generating 15 Loans...");
    const loans = [];
    const banks = createdUsers.filter(u => u.role === "bank");

    for (let i = 0; i < 15; i++) {
      const farmer = farmers[i % farmers.length];
      const farm = createdFarms.find(f => f.farmerId.toString() === farmer._id.toString());
      loans.push({
        farmerId: farmer._id,
        farmId: farm._id,
        amountRequested: 50000 + Math.floor(Math.random() * 450000),
        purpose: ["Seeds Procurement", "Irrigation", "Tractor Lease", "Fertilizers"][Math.floor(Math.random() * 4)],
        aiCreditScore: 400 + Math.floor(Math.random() * 500),
        riskCategory: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        status: ["pending", "approved", "rejected"][Math.floor(Math.random() * 3)],
        bankNotes: "Verified via AI Score sync."
      });
    }
    await Loan.insertMany(loans);
    console.log("Loans seeded.");

    // 7. Action Rooms (New Module)
    console.log("Generating Action Rooms...");
    const roomTopics = [
      "Crop Price Stabilization meeting",
      "Turmeric Export Strategy",
      "Cardamom Auction Planning",
      "Farmer Loan Review Meeting",
      "Pest Alert Response Center"
    ];

    for (let i = 0; i < 5; i++) {
      const room = await ActionRoom.create({
        title: roomTopics[i],
        description: `Strategic coordination session for ${districts[i]} cluster.`,
        createdBy: createdUsers.find(u => u.role === "admin")._id,
        participants: [farmers[i]._id, farmers[i+1]._id, createdUsers.find(u => u.role === "bank")._id],
        startTime: new Date(),
        priorityLevel: i === 1 ? "critical" : "high",
        status: "open"
      });

      // Tasks for room
      await ActionTask.create({
        actionRoomId: room._id,
        assignedTo: farmers[i]._id,
        title: `Upload NDVI Reports for ${districts[i]}`,
        priority: "high"
      });

      if (i % 2 === 0) {
        await ActionDecision.create({
          actionRoomId: room._id,
          decisionText: `Approved unified floor price for ${cropDatabase.spices[0].name} in ${districts[i]}.`,
          impactLevel: "high"
        });
      }
    }
    console.log("Action Rooms seeded.");

    // 8. Transactions & Notifications
    console.log("Syncing Wallets & Notifications...");
    for (let i = 0; i < 20; i++) {
        const u = createdUsers[i];
        const w = wallets.find(wal => wal.user.toString() === u._id.toString());
        if (!w) continue;

        await Transaction.create({
            wallet: w._id,
            type: "deposit",
            amount: 5000,
            status: "completed",
            description: "Onboarding Bonus"
        });

        await Notification.create({
            recipient: u._id,
            type: "SYSTEM",
            title: "Welcome to AgriSphere",
            message: `Hello ${u.name}, welcome to the Tamil Nadu regional node.`
        });
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedData();
