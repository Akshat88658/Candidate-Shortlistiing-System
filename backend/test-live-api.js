const fetch = require('node-fetch');

// CHANGE THIS to your actual Render URL if it is different
const RENDER_URL = 'https://candidate-shortlisting.onrender.com/api';

async function diagnose() {
  console.log(`🔍 Testing connection to: ${RENDER_URL}/health`);
  
  try {
    const res = await fetch(`${RENDER_URL}/health`);
    console.log(`📡 Status Code: ${res.status}`);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Backend is UP and reachable!');
      console.log('Response:', data);
    } else {
      console.error('❌ Backend returned an error. Is the URL correct?');
      const text = await res.text();
      console.log('Raw Response:', text.substring(0, 200));
    }
  } catch (err) {
    console.error('❌ Failed to connect to the backend.');
    console.error('Error:', err.message);
    console.log('\nPossible reasons:');
    console.log('1. The URL in apiService.js is wrong (check for typos).');
    console.log('2. The Render service is sleeping or spinning up.');
    console.log('3. Your internet is blocking the connection.');
  }
}

diagnose();
