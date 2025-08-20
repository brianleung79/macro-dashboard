const axios = require('axios');

async function testFredAPI() {
  try {
    console.log('=== Testing FRED API Directly ===');
    
    const fredUrl = 'https://api.stlouisfed.org/fred/series/observations';
    const apiKey = 'abf2178d3c7946daaddfb379a2567750';
    
    const params = {
      series_id: 'GDPC1',
      api_key: apiKey,
      file_type: 'json',
      observation_start: '2000-01-01',
      observation_end: '2024-01-01',
      aggregation_method: 'avg'
    };
    
    console.log('Testing with params:', params);
    
    const response = await axios.get(fredUrl, { 
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'Macro-Analysis-App/1.0'
      }
    });
    
    console.log('=== FRED API Response ===');
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Data keys: ${Object.keys(response.data)}`);
    console.log(`Observations count: ${response.data.observations?.length || 0}`);
    
    if (response.data.observations && response.data.observations.length > 0) {
      console.log(`First observation:`, response.data.observations[0]);
      console.log(`Last observation:`, response.data.observations[response.data.observations.length - 1]);
    }
    
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFredAPI();
