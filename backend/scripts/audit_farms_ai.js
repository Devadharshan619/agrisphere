const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const AI_URL = 'http://localhost:8000';

async function runAudit() {
  console.log('--- STARTING PLATFORM AUDIT ---');
  let token;
  let farmId;

  try {
    // 1. Auth Check (Reuse or New)
    console.log('Test Phase 3: Auth...');
    const regRes = await axios.post(`${BASE_URL}/users/register`, {
      name: 'Audit User',
      email: `audit_${Date.now()}@test.com`,
      password: 'password123',
      role: 'farmer'
    });
    token = regRes.data.token;
    console.log('SUCCESS: Auth verified.');

    // 2. Farm Management (Phase 4)
    console.log('Test Phase 4: Farm Management...');
    const farmRes = await axios.post(`${BASE_URL}/farms/add`, {
      farmName: 'Audit Acres',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      boundaries: {
        type: 'Polygon',
        coordinates: [[[77.59, 12.97], [77.60, 12.97], [77.60, 12.98], [77.59, 12.98], [77.59, 12.97]]]
      },
      cropType: 'Wheat',
      area: 10,
      soilType: 'Loamy'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    farmId = farmRes.data.data._id;
    console.log('SUCCESS: Farm created.', farmId);

    // 3. AI Microservice (Phase 5)
    console.log('Test Phase 5: AI Microservice...');
    
    // Test Yield Prediction
    console.log('  Testing /predict-yield...');
    const yieldRes = await axios.post(`${AI_URL}/predict-yield`, {
        crop_type: "Wheat",
        soil_moisture: 45.5,
        temperature: 28.2,
        rainfall: 120,
        farm_size_acres: 10
    });
    console.log('  SUCCESS: Yield predicted.', yieldRes.data.predicted_yield_kg);

    // Test Growth Forecast
    console.log('  Testing /growth-forecast...');
    const forecastRes = await axios.post(`${AI_URL}/growth-forecast`, {
        farm_id: farmId,
        current_ndvi: 0.65,
        historical_ndvi: [0.60, 0.62, 0.64],
        forecast_days: 7
    });
    console.log('  SUCCESS: Forecast received.', forecastRes.data.forecast.length, 'days');

    console.log('\n--- AUDIT PHASES 3-5 COMPLETED SUCCESSFULLY ---');

  } catch (err) {
    console.error('AUDIT FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAudit();
