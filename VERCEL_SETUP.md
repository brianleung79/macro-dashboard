# Vercel Serverless Functions Setup

This project has been converted from an Express.js backend to Vercel serverless functions.

## What Changed

### Before (Express.js)
- Single `server.js` file running on port 3001
- Combined frontend and backend in one server
- Required separate deployment for backend

### After (Vercel Functions)
- API endpoints as individual serverless functions
- Frontend builds to static files
- Everything deployed together on Vercel

## API Endpoints

### `/api/fred/[seriesId]`
- **Method**: GET
- **Purpose**: Proxy for FRED API calls
- **Parameters**: 
  - `seriesId`: FRED series identifier
  - `start`: Start date (optional)
  - `end`: End date (optional)
  - `frequency`: Data frequency (default: 'm')
  - `aggregation`: Aggregation method (default: 'avg')

### `/api/health`
- **Method**: GET
- **Purpose**: Health check endpoint
- **Response**: Status and timestamp

## Environment Variables

Set these in your Vercel dashboard:

```
FRED_API_KEY=your_fred_api_key_here
NODE_ENV=production
```

## Local Development

1. **Frontend**: `npm start` (runs on localhost:3000)
2. **API Testing**: Use tools like Postman or curl to test endpoints
3. **Vercel CLI**: Install and run `vercel dev` for local API testing

## Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Benefits

- ✅ No backend server management
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ Integrated deployment
- ✅ Cost-effective for low to medium traffic
