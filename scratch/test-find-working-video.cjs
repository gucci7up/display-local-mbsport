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
    const videos = res.data;
    console.log(`Fetched ${videos.length} videos from database.`);

    let workingCount = 0;
    // Test the first 50 videos
    for (let i = 0; i < Math.min(videos.length, 100); i++) {
      const video = videos[i];
      const filename = `${video.nombre}.webm`;
      const url = `${API_URL}/videos/${filename}`;
      try {
        const checkRes = await axios.head(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`FOUND WORKING VIDEO: ${filename} (Status: ${checkRes.status}, Content-Type: ${checkRes.headers['content-type']})`);
        workingCount++;
        break; // Stop at first working video
      } catch (err) {
        // Suppress failure log to avoid clutter
      }
    }
    console.log(`Scan completed. Found ${workingCount} working videos.`);
  } catch (err) {
    console.error("Main error:", err.message);
  }
}

main();
