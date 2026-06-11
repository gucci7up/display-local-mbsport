const axios = require('axios');
const API_URL = 'https://api.mbracesrd.lat';
const DEFAULT_EMAIL = 'display@mbsport.com';
const DEFAULT_PASSWORD = 'display123';
const FILENAME = '1.webm';

async function main() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
    });
    const token = loginRes.data.accessToken;
    console.log("Token obtained successfully.");

    const paths = [
      `/static/${FILENAME}`,
      `/public/${FILENAME}`,
      `/uploads/${FILENAME}`,
      `/assets/${FILENAME}`,
      `/videos/${FILENAME}`,
      `/${FILENAME}`,
      `/video-files/${FILENAME}`,
      `/opt/mbraces/videos/${FILENAME}`,
      `/static/videos/${FILENAME}`,
      `/public/videos/${FILENAME}`
    ];

    for (const p of paths) {
      const url = `${API_URL}${p}`;
      try {
        const res = await axios.head(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`With Auth: SUCCESS -> ${p} (Status: ${res.status}, Content-Type: ${res.headers['content-type']})`);
      } catch (err) {
        console.log(`With Auth: FAILED -> ${p} (Status: ${err.response ? err.response.status : err.message})`);
      }
      
      try {
        const res = await axios.head(url);
        console.log(`No Auth: SUCCESS -> ${p} (Status: ${res.status}, Content-Type: ${res.headers['content-type']})`);
      } catch (err) {
        console.log(`No Auth: FAILED -> ${p} (Status: ${err.response ? err.response.status : err.message})`);
      }
      console.log('---');
    }
  } catch (err) {
    console.error("Main error:", err.message);
  }
}

main();
