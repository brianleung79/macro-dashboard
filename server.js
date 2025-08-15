const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// FRED API proxy endpoint
app.get('/api/fred/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { start, end, frequency = 'm', aggregation = 'avg' } = req.query;
    
    console.log(`Fetching FRED data for series: ${seriesId}, start: ${start}, end: ${end}`);
    
    const fredUrl = 'https://api.stlouisfed.org/fred/series/observations';
    const params = {
      series_id: seriesId,
      api_key: 'abf2178d3c7946daaddfb379a2567750',
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on port ${PORT}`);
  console.log(`📊 FRED API proxy available at http://localhost:${PORT}/api/fred/:seriesId`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
});
