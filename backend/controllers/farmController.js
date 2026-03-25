const Farm = require("../models/Farm");
const axios = require("axios");
const { sendNotification } = require("../services/telegramService");

exports.addFarm = async (req, res) => {
  try {
    const { farmName, location, boundaries, cropType, area, soilType } = req.body;
    
    // Robust GeoJSON formatting for Mongoose
    const formattedLocation = {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    };

    const formattedBoundaries = {
      type: 'Polygon',
      coordinates: [boundaries] // Nested array for polygon rings
    };

    const farm = new Farm({
      farmerId: req.user.id,
      farmName,
      location: formattedLocation,
      boundaries: formattedBoundaries,
      cropType,
      area,
      soilType
    });

    await farm.save();
    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    console.error("Add Farm Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

exports.analyzeFarm = async (req, res) => {
    try {
        const farmId = req.params.id;
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ success: false, message: "Farm not found" });

        // Simulate spectral data collection
        const dummyNDVI = Array.from({length: 12}, () => Math.random() * 0.4 + 0.4);
        const avgNdvi = dummyNDVI.reduce((a, b) => a + b, 0) / dummyNDVI.length;
        
        // Proxy to AI Service
        const aiResponse = await axios.post("http://localhost:8000/crop-health-analysis", {
            farm_id: farm._id,
            ndvi_values: dummyNDVI,
            soil_moisture: 42.5
        });

        const healthData = aiResponse.data;

        // Trigger Telegram alert if health is suboptimal
        if (healthData.health_status !== "Standard Growth" && avgNdvi < 0.6) {
            await sendNotification(
                farm.farmerId,
                `🚨 *Farm Health Alert: ${farm.farmName}* 🚨\nStatus: *${healthData.health_status}*\nNDVI: *${avgNdvi.toFixed(3)}*\nRecommendations: ${healthData.recommendations.join(", ")}`
            );
        }

        res.json({ success: true, data: healthData });
    } catch (error) {
        console.error("Analysis proxy error:", error.message);
        res.status(500).json({ success: false, message: "AI Service Connectivity Issue" });
    }
};

exports.getFarms = async (req, res) => {
  try {
    const Farm = require("../models/Farm");
    const farms = await Farm.find({ farmerId: req.user.id });
    res.status(200).json({ success: true, data: farms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};