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
    
    const raceRes = await axios.get(`${API_URL}/races/current`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(raceRes.data, null, 2));
  } catch (err) {
    console.error("Error: ", err.response ? err.response.data : err.message);
  }
}

main();
