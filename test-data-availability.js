// Test script to check data availability for all variables
const { DataLoader } = require('./src/utils/dataLoader');

async function testDataAvailability() {
  try {
    console.log('Starting data availability check...');
    const results = await DataLoader.checkAllVariablesDataAvailability();
    
    console.log('\n=== DETAILED RESULTS ===');
    results.forEach(result => {
      const { variable, availability, has20Years } = result;
      const status = has20Years ? '✅' : '❌';
      console.log(`${status} ${variable.series} (${variable.fredTicker})`);
      
      if (availability) {
        const startDate = new Date(availability.startDate);
        const endDate = new Date(availability.endDate);
        const yearsDiff = (endDate.getFullYear() - startDate.getFullYear()) + 
                         (endDate.getMonth() - startDate.getMonth()) / 12;
        console.log(`   Range: ${availability.startDate} to ${availability.endDate}`);
        console.log(`   Duration: ${yearsDiff.toFixed(1)} years`);
        console.log(`   Data points: ${availability.dataPoints}`);
      } else {
        console.log(`   Availability: Unknown`);
      }
      console.log('');
    });
    
    // Summary by category
    console.log('=== SUMMARY BY CATEGORY ===');
    const byCategory = {};
    results.forEach(result => {
      const category = result.variable.category || 'Unknown';
      if (!byCategory[category]) {
        byCategory[category] = { total: 0, with20Years: 0 };
      }
      byCategory[category].total++;
      if (result.has20Years) {
        byCategory[category].with20Years++;
      }
    });
    
    Object.entries(byCategory).forEach(([category, stats]) => {
      const percentage = ((stats.with20Years / stats.total) * 100).toFixed(1);
      console.log(`${category}: ${stats.with20Years}/${stats.total} (${percentage}%) have 20+ years`);
    });
    
  } catch (error) {
    console.error('Error testing data availability:', error);
  }
}

testDataAvailability();
