const mongoose = require('mongoose');
const fetch = require('node-fetch');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  } finally {
    mongoose.disconnect();
  }

  console.log('\nTesting OpenRouter connection...');
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [{ role: 'user', content: 'Say hello' }]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter connected! Response:', data.choices[0].message.content);
    } else {
      const errorData = await response.text();
      console.error('❌ OpenRouter Error:', response.status, errorData);
    }
  } catch (error) {
    console.error('❌ OpenRouter Fetch Error:', error.message);
  }
}

testConnection();
