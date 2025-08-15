const axios = require('axios');

const goldSeriesToTest = [
  'GOLDPMGBD228NLBM',  // Original one (doesn't work)
  'GOLD',               // Simple gold
  'GOLDPM',             // Gold PM
  'GOLDAM',             // Gold AM
  'GOLDPMGBD',          // Gold PM GB
  'GOLDAMGBD',          // Gold AM GB
  'GOLDPMGBD228NLBM',   // Full original
  'GOLDPMGBD228NLBM',   // Duplicate to test
  'GOLDPMGBD228NLBM',   // Another duplicate
  'GOLDPMGBD228NLBM'    // Final duplicate
];

async function testGoldSeries(seriesId) {
  try {
    console.log(`🧪 Testing Gold Series: ${seriesId}`);
    
    const testUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=abf2178d3c7946daaddfb379a2567750&file_type=json&observation_start=2019-01-01&observation_end=2024-01-01&frequency=m&aggregation_method=avg`;
    
    const response = await axios.get(testUrl);
    
    console.log(`✅ ${seriesId} - Status: ${response.status}, Observations: ${response.data.observations?.length || 0}`);
    return true;
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`❌ ${seriesId} - Series does not exist`);
    } else {
      console.log(`❌ ${seriesId} - Error: ${error.message}`);
    }
    return false;
  }
}

async function testAllGoldSeries() {
  console.log('🔍 Testing all potential gold series IDs...\n');
  
  for (const seriesId of goldSeriesToTest) {
    await testGoldSeries(seriesId);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Testing complete!');
}

testAllGoldSeries();
