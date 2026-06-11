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
    
    // Check with Authorization Header
    try {
      const res = await axios.head(`${API_URL}/videos/54.webm`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`With Header: SUCCESS -> Status: ${res.status}`);
    } catch (err) {
      console.log(`With Header: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
    }
    
    // Check with Query Param token
    try {
      const res = await axios.head(`${API_URL}/videos/54.webm?token=${token}`);
      console.log(`With token query: SUCCESS -> Status: ${res.status}`);
    } catch (err) {
      console.log(`With token query: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
    }

    // Check with Query Param accessToken
    try {
      const res = await axios.head(`${API_URL}/videos/54.webm?accessToken=${token}`);
      console.log(`With accessToken query: SUCCESS -> Status: ${res.status}`);
    } catch (err) {
      console.log(`With accessToken query: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
    }

  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

main();
