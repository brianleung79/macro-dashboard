const axios = require('axios');

const API_KEY = 'abf2178d3c7946daaddfb379a2567750';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

async function testFREDAPI() {
  try {
    console.log('🧪 Testing FRED API...');
    console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
    
    const testUrl = `${FRED_BASE_URL}?series_id=DGS10&api_key=${API_KEY}&file_type=json&observation_start=2020-01-01&observation_end=2024-01-01&frequency=m&aggregation_method=avg`;
    
    console.log('Request URL:', testUrl);
    
    const response = await axios.get(testUrl);
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data Keys:', Object.keys(response.data));
    console.log('✅ Observations Count:', response.data.observations?.length || 0);
    
    if (response.data.observations && response.data.observations.length > 0) {
      console.log('✅ First Observation:', response.data.observations[0]);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testFREDAPI();
