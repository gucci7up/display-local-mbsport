const axios = require('axios');
const API_URL = 'https://api.mbracesrd.lat';
const DEFAULT_EMAIL = 'display@mbsport.com';
const DEFAULT_PASSWORD = 'display123';
const VIDEO_ID = 'c9b74545-d49c-47af-8b99-ebefb30fc9c4';

async function main() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
    });
    const token = loginRes.data.accessToken;

    const url = `${API_URL}/videos/${VIDEO_ID}`;
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`GET SUCCESS: ${url}`);
      console.log(`Data:`, JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log(`GET FAILED: ${url} -> Status: ${err.response ? err.response.status : err.message}`);
    }
  } catch (err) {
    console.error("Main error:", err.message);
  }
}

main();
