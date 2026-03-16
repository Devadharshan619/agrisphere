const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const http = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

const farmRoutes = require("./routes/farmRoutes")
const userRoutes = require("./routes/userRoutes")
const walletRoutes = require("./routes/walletRoutes")
const marketplaceRoutes = require("./routes/marketplaceRoutes")
const loanRoutes = require("./routes/loanRoutes")
const auctionRoutes = require("./routes/auctionRoutes")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.log(err))

// Inject io into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/users", userRoutes)
app.use("/api/farms", farmRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/marketplace", marketplaceRoutes)
app.use("/api/loans", loanRoutes)
app.use("/api/auctions", auctionRoutes)

app.get("/", (req,res)=>{
 res.send("AgriSphere Backend API Running")
})

// Socket.io logic
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
 console.log(`Server running on port ${PORT}`)
})