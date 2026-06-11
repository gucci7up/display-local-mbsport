const axios = require('axios');

const prefixes = [
  'https://api.mbracesrd.lat/videos/54.webm',
  'https://api.mbracesrd.lat/opt/mbraces/videos/54.webm',
  'https://api.mbracesrd.lat/static/videos/54.webm',
  'https://api.mbracesrd.lat/54.webm',
  'https://api.mbracesrd.lat/videos/54.mp4'
];

async function check(url) {
  try {
    const res = await axios.head(url);
    console.log(`SUCCESS: ${url} -> Status: ${res.status}`);
    return true;
  } catch (err) {
    console.log(`FAILED: ${url} -> Status: ${err.response ? err.response.status : err.message}`);
    return false;
  }
}

async function main() {
  for (const url of prefixes) {
    await check(url);
  }
}

main();
