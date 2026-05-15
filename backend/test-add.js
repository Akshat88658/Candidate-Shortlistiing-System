const fetch = require('node-fetch');

async function testAdd() {
  try {
    const res = await fetch('http://localhost:5000/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        skills: ['React', 'Node.js'],
        experience: 2,
        bio: 'Test bio'
      })
    });
    
    const data = await res.json();
    console.log(res.status, data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAdd();
