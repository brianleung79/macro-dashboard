const axios = require('axios');

async function testProxy() {
  try {
    console.log('🧪 Testing CORS Proxy...');
    
    const testUrl = 'https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=abf2178d3c7946daaddfb379a2567750&file_type=json&observation_start=2020-01-01&observation_end=2024-01-01&frequency=m&aggregation_method=avg';
    
    const proxyUrl = `http://localhost:3001/proxy/fred?url=${encodeURIComponent(testUrl)}`;
    
    console.log('Proxy URL:', proxyUrl);
    
    const response = await axios.get(proxyUrl);
    
    console.log('✅ Proxy Response Status:', response.status);
    console.log('✅ Response Data Keys:', Object.keys(response.data));
    console.log('✅ Observations Count:', response.data.observations?.length || 0);
    
  } catch (error) {
    console.error('❌ Proxy Test Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testProxy();
