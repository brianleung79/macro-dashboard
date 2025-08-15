# Deployment Guide for Macro Analysis App

## Overview
This app now uses a backend proxy server to avoid CORS issues with the FRED API. The backend acts as a bridge between your frontend and the FRED API.

## Architecture
- **Frontend**: React app (port 3000 in development)
- **Backend**: Express proxy server (port 3001 in development)
- **Production**: Both can run on the same server or different servers

## Local Development Setup

### 1. Install Backend Dependencies
```bash
# Install backend dependencies
npm install --prefix . express axios cors

# Or if you want to use the separate server-package.json:
cp server-package.json package.json.backend
cd package.json.backend
npm install
```

### 2. Start Backend Server
```bash
# In one terminal (backend)
node server.js

# Or with nodemon for development:
npm install -g nodemon
nodemon server.js
```

### 3. Start Frontend
```bash
# In another terminal (frontend)
npm start
```

## Production Deployment

### Option 1: Same Server (Recommended for simplicity)

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Deploy both to your server:**
   - Upload the `build` folder and `server.js` to your server
   - Install Node.js dependencies: `npm install express axios cors`
   - Start the server: `node server.js`

3. **Update the backend URL in production:**
   Edit `src/services/fredService.ts` and change:
   ```typescript
   private static BACKEND_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-actual-domain.com'  // Change this!
     : 'http://localhost:3001';
   ```

### Option 2: Separate Servers

1. **Deploy backend to one server:**
   - Upload `server.js` and install dependencies
   - Set environment variables for FRED API key
   - Start the server

2. **Deploy frontend to another server:**
   - Build and upload the React app
   - Update the backend URL to point to your backend server

3. **Configure CORS:**
   The backend already has CORS enabled, but you can restrict it to your frontend domain:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.com'
   }));
   ```

## Environment Variables

Create a `.env` file for production:
```bash
# .env
FRED_API_KEY=your_fred_api_key_here
PORT=3001
NODE_ENV=production
```

## Testing the Setup

1. **Test backend health:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test FRED proxy:**
   ```bash
   curl "http://localhost:3001/api/fred/FEDFUNDS?start=2023-01-01&end=2024-01-01"
   ```

3. **Test frontend:**
   - Open your app in the browser
   - Select variables and click "Run Analysis"
   - Check browser console for backend proxy calls

## Troubleshooting

### Common Issues:

1. **"Backend proxy failed" error:**
   - Ensure backend server is running
   - Check if backend URL is correct in `fredService.ts`
   - Verify backend is accessible from frontend

2. **CORS errors:**
   - Backend should handle CORS automatically
   - Check if backend CORS configuration is correct

3. **FRED API errors:**
   - Verify FRED API key is valid
   - Check backend logs for detailed error messages

### Debug Steps:

1. Check backend console logs when making requests
2. Check browser console for frontend errors
3. Test backend endpoints directly with curl/Postman
4. Verify network connectivity between frontend and backend

## Security Considerations

1. **API Key Protection:**
   - Never expose FRED API key in frontend code
   - Use environment variables on backend
   - Consider rate limiting for FRED API calls

2. **CORS Configuration:**
   - Restrict CORS to only your frontend domains
   - Consider using a reverse proxy (nginx) for additional security

## Performance Optimization

1. **Caching:**
   - Implement Redis caching for frequently requested FRED data
   - Cache data for 24 hours (FRED data updates daily)

2. **Rate Limiting:**
   - Implement rate limiting per user/IP
   - Respect FRED API rate limits

3. **Compression:**
   - Enable gzip compression on backend responses
   - Use compression middleware in Express
