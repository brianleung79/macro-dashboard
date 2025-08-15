const axios = require('axios');

async function testNewGoldSeries() {
  try {
    console.log('🧪 Testing New Gold Series (GOLDPMGBD228NLBM)...');
    
    const testUrl = 'https://api.stlouisfed.org/fred/series/observations?series_id=GOLDPMGBD228NLBM&api_key=abf2178d3c7946daaddfb379a2567750&file_type=json&observation_start=2019-01-01&observation_end=2024-01-01&frequency=m&aggregation_method=avg';
    
    console.log('Direct API URL:', testUrl);
    
    const response = await axios.get(testUrl);
    
    console.log('✅ New Gold Series API Response Status:', response.status);
    console.log('✅ Response Data Keys:', Object.keys(response.data));
    console.log('✅ Observations Count:', response.data.observations?.length || 0);
    
    if (response.data.observations && response.data.observations.length > 0) {
      console.log('✅ First Observation:', response.data.observations[0]);
    }
    
  } catch (error) {
    console.error('❌ New Gold Series API Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testNewGoldSeries();
