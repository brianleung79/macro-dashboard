const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the seriesId from the URL path
    const pathParts = req.url.split('/');
    const seriesId = pathParts[pathParts.length - 1].split('?')[0];
    
    if (!seriesId || seriesId === '') {
      console.error('No series ID found in URL:', req.url);
      return res.status(400).json({ error: 'Series ID is required' });
    }
    
    // Get query parameters
    const { start, end, frequency = 'm', aggregation = 'avg' } = req.query;
    
    console.log(`=== FRED API Request ===`);
    console.log(`Series ID: ${seriesId}`);
    console.log(`Start: ${start}`);
    console.log(`End: ${end}`);
    console.log(`Frequency: ${frequency}`);
    console.log(`Aggregation: ${aggregation}`);
    console.log(`Full URL: ${req.url}`);
    
    // Make request to FRED API
    const fredUrl = 'https://api.stlouisfed.org/fred/series/observations';
    const params = {
      series_id: seriesId,
      api_key: process.env.FRED_API_KEY || 'abf2178d3c7946daaddfb379a2567750',
      file_type: 'json',
      observation_start: start,
      observation_end: end,
      frequency: frequency,
      aggregation_method: aggregation
    };
    
    console.log('FRED API parameters:', params);
    
    const response = await axios.get(fredUrl, { params });
    
    console.log(`=== FRED API Response ===`);
    console.log(`Status: ${response.status}`);
    console.log(`Data keys: ${Object.keys(response.data)}`);
    console.log(`Observations count: ${response.data.observations?.length || 0}`);
    
    // Validate the response
    if (!response.data) {
      throw new Error('No data received from FRED API');
    }
    
    if (!response.data.observations) {
      throw new Error('FRED API response missing observations data');
    }
    
    if (!Array.isArray(response.data.observations)) {
      throw new Error('FRED API observations is not an array');
    }
    
    // Return the data exactly as FRED provides it
    res.json(response.data);
    
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      res.status(error.response.status).json({
        error: 'FRED API error',
        status: error.response.status,
        details: error.response.data
      });
    } else {
      console.error('No response object:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
};
