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
    // Extract seriesId from the URL path
    const seriesId = req.url.split('/').pop().split('?')[0];
    const { start, end, frequency = 'm', aggregation = 'avg' } = req.query;
    
    console.log(`Fetching FRED data for series: ${seriesId}, start: ${start}, end: ${end}`);
    
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
    
    const response = await axios.get(fredUrl, { params });
    
    console.log(`Successfully fetched ${response.data.observations?.length || 0} observations for ${seriesId}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching FRED data:', error.message);
    
    if (error.response) {
      console.error('FRED API response error:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        error: 'FRED API error',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
};
