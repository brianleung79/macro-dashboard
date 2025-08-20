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
    // Get the seriesId from the URL path - handle both /seriesId and /seriesId/info
    const pathParts = req.url.split('/');
    let seriesId = '';
    let isInfoRequest = false;
    
    // Check if this is an info request
    if (pathParts.includes('info')) {
      isInfoRequest = true;
      // For info requests, seriesId is the second-to-last part
      // URL format: /api/fred/SERIES/info
      seriesId = pathParts[pathParts.length - 2];
    } else {
      // For data requests, seriesId is the last part
      // URL format: /api/fred/SERIES
      seriesId = pathParts[pathParts.length - 1].split('?')[0];
    }

    if (!seriesId || seriesId === '') {
      console.error('No series ID found in URL:', req.url);
      console.error('Path parts:', pathParts);
      return res.status(400).json({ error: 'Series ID is required' });
    }

    console.log(`=== Request Details ===`);
    console.log(`Full URL: ${req.url}`);
    console.log(`Path parts:`, pathParts);
    console.log(`Series ID: ${seriesId}`);
    console.log(`Is Info Request: ${isInfoRequest}`);
    
    if (isInfoRequest) {
      // Handle series info request
      console.log(`=== FRED Series Info Request ===`);
      console.log(`Series ID: ${seriesId}`);

      const fredUrl = 'https://api.stlouisfed.org/fred/series';
      const apiKey = 'abf2178d3c7946daaddfb379a2567750';
      
      const params = {
        series_id: seriesId,
        api_key: apiKey,
        file_type: 'json'
      };

      console.log('FRED Series API parameters:', params);

      const response = await axios.get(fredUrl, { params });

      console.log(`=== FRED Series Info Response ===`);
      console.log(`Status: ${response.status}`);
      console.log(`Data keys: ${Object.keys(response.data)}`);

      if (!response.data) {
        throw new Error('No data received from FRED API');
      }

      if (!response.data.seriess || !Array.isArray(response.data.seriess) || response.data.seriess.length === 0) {
        throw new Error('FRED API response missing series data');
      }

      // Return the first series info
      res.json(response.data.seriess[0]);

    } else {
      // Handle observations request (existing logic)
      // Get query parameters
      const { start, end, frequency, aggregation = 'avg' } = req.query;

      console.log(`=== FRED API Request ===`);
      console.log(`Series ID: ${seriesId}`);
      console.log(`Start: ${start}`);
      console.log(`End: ${end}`);
      console.log(`Frequency: ${frequency}`);
      console.log(`Aggregation: ${aggregation}`);

      // Make request to FRED API
      const fredUrl = 'https://api.stlouisfed.org/fred/series/observations';
      const apiKey = 'abf2178d3c7946daaddfb379a2567750';

      // Build params, but only include frequency if it's provided and valid
      const params = {
        series_id: seriesId,
        api_key: apiKey,
        file_type: 'json',
        observation_start: start,
        observation_end: end,
        aggregation_method: aggregation
      };

      // Only add frequency if it's provided and not empty
      if (frequency && frequency.trim() !== '') {
        params.frequency = frequency;
      }

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
    }

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response status text:', error.response.statusText);
      console.error('Response headers:', error.response.headers);
      res.status(error.response.status).json({
        error: 'FRED API error',
        status: error.response.status,
        statusText: error.response.statusText,
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', error.request);

      res.status(500).json({
        error: 'No response from FRED API',
        message: 'Request was made but no response was received'
      });
    } else {
      console.error('Error setting up request:', error.message);

      res.status(500).json({
        error: 'Request setup error',
        message: error.message
      });
    }
  }
};
