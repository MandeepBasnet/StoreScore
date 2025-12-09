# Backend Deployment Guide (Render)

## Step 1: Deploy Backend on Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `MandeepBasnet/StoreScore`
3. Configure the service:

   **Basic Settings:**
   - **Name**: `storescore-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Select **"Free"**

### 1.3 Set Environment Variables
Click **"Advanced"** and add these environment variables:

```bash
NODE_ENV=production
XIBO_CMS_URL=<your_xibo_cms_url>
XIBO_CLIENT_ID=<your_client_id>
XIBO_CLIENT_SECRET=<your_client_secret>
JWT_SECRET=<your_jwt_secret>
```

> **Important**: Copy these values from your local `backend/.env` file

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (2-3 minutes)
3. You'll get a URL like: `https://storescore-backend.onrender.com`

---

## Step 2: Connect Frontend (Vercel) to Backend (Render)

### 2.1 Update Frontend API Configuration

You need to configure your frontend to use the backend URL. Let's check how your frontend makes API calls:

#### Option A: Using Environment Variables (Recommended)

1. **Create `.env` file in frontend** (if not exists):
   ```bash
   VITE_API_URL=https://storescore-backend.onrender.com
   ```

2. **Update Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://storescore-backend.onrender.com`
     - **Environment**: Production, Preview, Development (select all)
   - Click **Save**
   - **Redeploy** your frontend

3. **Use in your code**:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   
   // Example API call
   axios.get(`${API_URL}/api/health`)
   ```

#### Option B: Direct URL Configuration

If you have a config file or axios instance, update it:

```javascript
// frontend/src/config/api.js or similar
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://storescore-backend.onrender.com'
  : 'http://localhost:5000';

export default API_BASE_URL;
```

### 2.2 Update CORS in Backend

Your backend needs to allow requests from your Vercel frontend:

1. **Update `backend/server.js`** CORS configuration:
   ```javascript
   const cors = require('cors');
   
   const corsOptions = {
     origin: [
       'http://localhost:5173', // Local development
       'https://your-vercel-app.vercel.app', // Replace with your Vercel URL
       'https://your-custom-domain.com' // If you have a custom domain
     ],
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

2. **Commit and push changes**:
   ```bash
   git add backend/server.js
   git commit -m "Update CORS for production"
   git push
   ```

3. Render will auto-deploy the changes

---

## Step 3: Test the Connection

### 3.1 Test Backend Health
Open in browser: `https://storescore-backend.onrender.com/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "StoreScore Backend is running",
  "timestamp": "2025-12-09T..."
}
```

### 3.2 Test Frontend-Backend Connection
1. Open your Vercel app
2. Open browser DevTools (F12) → Network tab
3. Perform an action that calls the API
4. Check if requests go to your Render backend URL
5. Verify responses are successful (200 status)

---

## Alternative: Deploy Both on Vercel

Since you're already on Vercel, you can also deploy the backend there:

### Vercel Backend Deployment

1. **Create `vercel.json` in backend directory**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Deploy backend separately**:
   - Go to Vercel dashboard
   - Click **"Add New"** → **"Project"**
   - Import same GitHub repo
   - Set **Root Directory**: `backend`
   - Deploy

3. You'll get a URL like: `https://storescore-backend.vercel.app`

---

## Troubleshooting

### CORS Errors
- Ensure backend CORS allows your Vercel frontend URL
- Check browser console for exact error message

### Backend Not Responding
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set correctly
- Ensure backend is not sleeping (free tier spins down)

### 404 Errors
- Verify API endpoints are prefixed with `/api`
- Check frontend is using correct backend URL

### Environment Variables Not Working
- Redeploy frontend after adding env vars in Vercel
- Check variable names match (VITE_ prefix required for Vite)

---

## Cost Comparison

| Platform | Free Tier | Limitations |
|----------|-----------|-------------|
| **Render** | 750 hrs/month | Spins down after 15 min inactivity |
| **Railway** | $5 credit/month | ~500 hours with basic app |
| **Fly.io** | 3 VMs free | 256MB RAM each |
| **Vercel** | Unlimited | Serverless functions (10s timeout) |

**Recommendation**: Start with Render for traditional Node.js server, or Vercel if you prefer serverless.
