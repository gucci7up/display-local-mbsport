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
    console.log("Token obtained successfully.");

    const res = await axios.get(`${API_URL}/videos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Videos: ", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Main error:", err.message);
  }
}

main();
