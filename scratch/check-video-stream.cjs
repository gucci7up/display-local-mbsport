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

    const urls = [
      `${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a/stream`,
      `${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a/file`,
      `${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a/play`,
      `${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a/download`,
      `${API_URL}/videos/ce69cc89-08cc-4d2a-8cb4-33af4804d20a/video`,
      `${API_URL}/races/video/ce69cc89-08cc-4d2a-8cb4-33af4804d20a`
    ];

    for (const url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer',
          maxContentLength: 1000 // limit download
        });
        console.log(`SUCCESS: ${url} -> Status: ${res.status}, Content-Type: ${res.headers['content-type']}`);
      } catch (err) {
        console.log(`FAILED: ${url} -> Status: ${err.response ? err.response.status : err.message}`);
      }
    }
  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

main();
