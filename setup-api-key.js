const fs = require('fs');
const path = require('path');

console.log('🔑 FRED API Key Setup');
console.log('=====================');
console.log('');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_actual_api_key_here')) {
    console.log('⚠️  Please update your API key in the .env file');
    console.log('   Replace "your_actual_api_key_here" with your real FRED API key');
  } else {
    console.log('✅ API key appears to be set');
  }
} else {
  console.log('📝 Creating .env file...');
  const envContent = 'REACT_APP_FRED_API_KEY=your_actual_api_key_here\n';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
  console.log('⚠️  Please update your API key in the .env file');
  console.log('   Replace "your_actual_api_key_here" with your real FRED API key');
}

console.log('');
console.log('📋 Next steps:');
console.log('1. Get your FRED API key from: https://fred.stlouisfed.org/docs/api/api_key.html');
console.log('2. Edit the .env file and replace "your_actual_api_key_here" with your real key');
console.log('3. Restart the development server: npm start');
console.log('');
console.log('💡 The .env file should look like:');
console.log('   REACT_APP_FRED_API_KEY=abc123def456...');



