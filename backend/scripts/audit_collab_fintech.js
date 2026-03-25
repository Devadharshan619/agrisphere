const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('--- STARTING COLLABORATION & FINTECH AUDIT ---');
  let token;

  try {
    // 1. Auth Setup
    console.log('Setting up Audit User...');
    const regRes = await axios.post(`${BASE_URL}/users/register`, {
      name: 'Collab Auditor', email: `collab_${Date.now()}@audit.com`, password: 'password123', role: 'admin'
    });
    token = regRes.data.token;
    console.log('SUCCESS: Auditor ready.');

    // 2. Phase 8: Fintech Mock Verification
    console.log('Phase 8: Fintech Mock...');
    const payRes = await axios.post(`${BASE_URL}/wallet/mock/payment-success`, { amount: 5000 }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  SUCCESS:', payRes.data.message);

    // 3. Phase 11: Meetings & Tasks
    console.log('Phase 11: Meetings & Tasks...');
    const meetRes = await axios.post(`${BASE_URL}/meetings/create`, {
      title: 'Monthly Harvest Planning',
      description: 'Discussing Wheat Q3 yield',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      location: 'Virtual Office'
    }, { headers: { Authorization: `Bearer ${token}` } });
    const meetingId = meetRes.data.data._id;
    console.log('  SUCCESS: Meeting scheduled.', meetingId);

    const taskRes = await axios.post(`${BASE_URL}/meetings/task`, {
      meetingId,
      assignedTo: regRes.data.user.id,
      title: 'Review Soil Reports',
      priority: 'high'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('  SUCCESS: Task assigned.', taskRes.data.data.title);

    // 4. Phase 12: Internal Notifications
    console.log('Phase 12: Notifications...');
    const notifyRes = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('  SUCCESS: Notification feed active. Count:', notifyRes.data.data.length);

    console.log('\n--- AUDIT PHASES 8, 11, 12 COMPLETED SUCCESSFULLY ---');

  } catch (err) {
    console.error('AUDIT FAILED:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAudit();
