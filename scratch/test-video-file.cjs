const axios = require('axios');
const API_URL = 'https://api.mbracesrd.lat';
const DEFAULT_EMAIL = 'display@mbsport.com';
const DEFAULT_PASSWORD = 'display123';
const VIDEO_FILENAME = '111.webm';

async function main() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
    });
    const token = loginRes.data.accessToken;
    console.log("Token obtained successfully.");

    // Test with header
    try {
      const res = await axios.get(`${API_URL}/videos/${VIDEO_FILENAME}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer',
        maxContentLength: 10000 // limit download
      });
      console.log(`With Header: SUCCESS -> Status: ${res.status}, Content-Length: ${res.headers['content-length']}, Content-Type: ${res.headers['content-type']}`);
    } catch (err) {
      console.log(`With Header: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
      if (err.response && err.response.data) {
        console.log(`Error data:`, err.response.data.toString());
      }
    }

    // Test without header
    try {
      const res = await axios.get(`${API_URL}/videos/${VIDEO_FILENAME}`, {
        responseType: 'arraybuffer',
        maxContentLength: 10000
      });
      console.log(`Without Header: SUCCESS -> Status: ${res.status}`);
    } catch (err) {
      console.log(`Without Header: FAILED -> Status: ${err.response ? err.response.status : err.message}`);
    }
  } catch (err) {
    console.error("Main error:", err.message);
  }
}

main();
