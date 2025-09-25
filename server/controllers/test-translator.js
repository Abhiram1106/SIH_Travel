// Test the translator API
const axios = require('axios');

async function testTranslator() {
  try {
    // Test languages endpoint
    const response = await axios.get('http://localhost:5000/api/translator/languages', {
      headers: {
        'Authorization': 'Bearer your-token-here' // Replace with actual token
      }
    });
    console.log('Languages API response:', response.data);
  } catch (error) {
    console.error('Languages API error:', error.response?.data || error.message);
  }
}

testTranslator();
