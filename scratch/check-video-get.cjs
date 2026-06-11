const axios = require('axios');
const API_URL = 'https://api.mbracesrd.lat';
const DEFAULT_EMAIL = 'display@mbsport.com';
const DEFAULT_PASSWORD = 'display123';

async function main() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
    });
    const token = loginRes.data.accessToken;
    
    try {
      const res = await axios.get(`${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Response data:", res.data);
    } catch (err) {
      console.log(`UUID GET: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
    }
  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

main();
