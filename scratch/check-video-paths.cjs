const axios = require('axios');
const API_URL = 'https://api.mbracesrd.lat';

const urls = [
  `${API_URL}/static/54.webm`,
  `${API_URL}/public/54.webm`,
  `${API_URL}/uploads/54.webm`,
  `${API_URL}/assets/54.webm`,
  `${API_URL}/video-files/54.webm`,
  `${API_URL}/opt/54.webm`,
  `${API_URL}/mbraces/54.webm`
];

async function main() {
  for (const url of urls) {
    try {
      const res = await axios.head(url);
      console.log(`SUCCESS: ${url} -> Status: ${res.status}`);
    } catch (err) {
      console.log(`FAILED: ${url} -> Status: ${err.response ? err.response.status : err.message}`);
    }
  }
}

main();
