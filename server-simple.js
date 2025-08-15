const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// FRED API proxy
app.get('/api/fred/:seriesId', async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { start, end } = req.query;
    
    console.log(`Fetching FRED data for: ${seriesId}, ${start} to ${end}`);
    
    const url = 'https://api.stlouisfed.org/fred/series/observations';
    const params = {
      series_id: seriesId,
      api_key: 'abf2178d3c7946daaddfb379a2567750',
      file_type: 'json',
      observation_start: start,
      observation_end: end,
      frequency: 'm',
      aggregation_method: 'avg'
    };
    
    const response = await axios.get(url, { params });
    console.log(`Success: ${response.data.observations?.length || 0} observations`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Test: http://localhost:${PORT}/test`);
});
