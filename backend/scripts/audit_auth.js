const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('--- STARTING AUTHENTICATION AUDIT ---');
  
  try {
    // 1. Register a Farmer
    console.log('Testing Registration (Farmer)...');
    const regRes = await axios.post(`${BASE_URL}/users/register`, {
      name: 'Test Farmer',
      email: `farmer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'farmer'
    });
    console.log('SUCCESS: Farmer registered.', regRes.data.user.email);
    const token = regRes.data.token;

    // 2. Test "Get Me" (Protected Route)
    console.log('Testing Protected Route (/me)...');
    const meRes = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS: Auth middleware verified. Role:', meRes.data.data.role);

    // 3. Test Login
    console.log('Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/users/login`, {
      email: regRes.data.user.email,
      password: 'password123'
    });
    console.log('SUCCESS: Login verified. Token received.');

  } catch (err) {
    console.error('AUDIT FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAudit();
