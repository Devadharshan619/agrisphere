exports.addFarm = async (req, res) => {
  try {
    const Farm = require("../models/Farm");
    const { farmName, location, boundaries, cropType, area, soilType } = req.body;
    
    const farm = new Farm({
      farmerId: req.user.id,
      farmName,
      location,
      boundaries,
      cropType,
      area,
      soilType
    });

    await farm.save();
    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
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