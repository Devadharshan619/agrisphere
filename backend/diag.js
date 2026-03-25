const fs = require('fs');
const path = require('path');

console.log("Starting diagnostics...");

const filesToTest = [
  "express",
  "cors",
  "mongoose",
  "http",
  "socket.io",
  "dotenv",
  "./routes/userRoutes",
  "./routes/farmRoutes",
  "./routes/walletRoutes",
  "./routes/marketplaceRoutes",
  "./routes/loanRoutes",
  "./routes/auctionRoutes"
];

process.chdir('d:/Pt2/proj/agrisphere/backend');

for (const file of filesToTest) {
  try {
    console.log(`Testing: ${file}`);
    require(file);
    console.log(`Success: ${file}`);
  } catch (err) {
    console.error(`FAILED: ${file}`);
    console.error(err);
    process.exit(1);
  }
}

console.log("All imports successful!");
