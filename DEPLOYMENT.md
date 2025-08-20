# Deployment Guide

## Vercel Deployment (Recommended)

This project is now configured to deploy on Vercel using serverless functions.

### Prerequisites
1. Vercel account
2. GitHub repository connected to Vercel
3. FRED API key

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Convert to Vercel serverless functions"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set Environment Variables**
   In your Vercel project dashboard:
   ```
   FRED_API_KEY=your_actual_fred_api_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Vercel will automatically build and deploy on each push
   - The build process will:
     - Build the React frontend
     - Deploy the API functions
     - Serve everything from Vercel's global CDN

### What Gets Deployed

- **Frontend**: React app built to static files
- **API Functions**: 
  - `/api/fred/[seriesId]` - FRED data proxy
  - `/api/health` - Health check
- **Static Assets**: CSV files, images, etc.

### Benefits

- ✅ Global CDN
- ✅ Automatic scaling
- ✅ No server management
- ✅ Integrated frontend + backend
- ✅ Automatic deployments

## Alternative: Traditional Server

If you prefer to keep the Express.js server:

1. **Frontend**: Build with `npm run build`
2. **Backend**: Deploy `server.js` to your preferred hosting (Heroku, Railway, etc.)
3. **Update URLs**: Modify `fredService.ts` to point to your backend URL

## Local Development

```bash
# Frontend only
npm start

# Full stack (if keeping Express)
npm run start:full  # You'd need to add this script
```

## Environment Variables

### Development
Create `.env.local`:
```
FRED_API_KEY=your_fred_api_key
NODE_ENV=development
```

### Production (Vercel)
Set in Vercel dashboard:
```
FRED_API_KEY=your_fred_api_key
NODE_ENV=production
```
