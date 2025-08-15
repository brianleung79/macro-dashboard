const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check if API key is available
    if (!process.env.FRED_API_KEY) {
      throw new Error('FRED API key not configured. Please set FRED_API_KEY environment variable.');
    }

    const { seriesId } = req.query;
    const { start, end } = req.query;

    console.log(`Fetching FRED data for: ${seriesId}, ${start} to ${end}`);

    const url = 'https://api.stlouisfed.org/fred/series/observations';
    const params = {
      series_id: seriesId,
      api_key: process.env.FRED_API_KEY, // Get from Vercel environment variable
      file_type: 'json',
      observation_start: start,
      observation_end: end,
      frequency: 'm',
      aggregation_method: 'avg'
    };

    const response = await axios.get(url, { params });
    console.log(`Success: ${response.data.observations?.length || 0} observations`);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
