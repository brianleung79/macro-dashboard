const axios = require('axios');

// Test the new Alpha Vantage symbols
const testSymbols = [
  // Commodities
  'GLD',   // Gold ETF
  'USO',   // Oil ETF
  'UNG',   // Natural Gas ETF
  'CPER',  // Copper ETF
  
  // Market Indices
  'SPY',   // S&P 500 ETF
  'IWM',   // Russell 2000 ETF
  'QQQ',   // Nasdaq ETF
  'FEZ',   // Euro Stoxx 50 ETF
  'EWU',   // UK ETF
  'EWG',   // Germany ETF
  'EWY',   // South Korea ETF
  'FXI',   // China ETF
  
  // Currency ETFs
  'UUP',   // US Dollar ETF
  'FXE',   // Euro ETF
  'FXY',   // Japanese Yen ETF
  'FXB'    // British Pound ETF
];

async function testSymbol(symbol) {
  try {
    console.log(`🧪 Testing symbol: ${symbol}`);
    
    // Use a mock API key for testing (replace with real one)
    const apiKey = 'demo'; // Replace with your actual API key
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data['Error Message']) {
      console.log(`❌ ${symbol} - Error: ${response.data['Error Message']}`);
      return false;
    }
    
    if (response.data['Note']) {
      console.log(`⚠️ ${symbol} - Rate limit warning: ${response.data['Note']}`);
      return false;
    }
    
    const timeSeriesData = response.data['Time Series (Daily)'];
    if (timeSeriesData) {
      const dataPoints = Object.keys(timeSeriesData).length;
      console.log(`✅ ${symbol} - Success! ${dataPoints} data points available`);
      return true;
    } else {
      console.log(`❌ ${symbol} - No time series data found`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ${symbol} - Request failed: ${error.message}`);
    return false;
  }
}

async function testAllSymbols() {
  console.log('🔍 Testing all Alpha Vantage symbols...\n');
  
  let successCount = 0;
  let totalCount = testSymbols.length;
  
  for (const symbol of testSymbols) {
    const success = await testSymbol(symbol);
    if (success) successCount++;
    
    // Rate limiting: wait 12 seconds between requests (5 calls per minute)
    await new Promise(resolve => setTimeout(resolve, 12000));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
}

// Run the test
testAllSymbols();
