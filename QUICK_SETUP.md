# Quick Setup Guide: Connect Vercel Frontend to Backend

## 🎯 Your Current Setup
- ✅ Frontend: Already deployed on Vercel
- ⏳ Backend: Need to deploy (we'll use Render - it's free!)
- ✅ Code: Already configured with environment variables

---

## 📋 Step-by-Step Instructions

### Step 1: Deploy Backend on Render (5 minutes)

1. **Go to [render.com](https://render.com)** and sign up with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your repository**: `MandeepBasnet/StoreScore`

4. **Configure the service**:
   - **Name**: `storescore-backend`
   - **Region**: Singapore (closest to asia-southeast1)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

5. **Add Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   XIBO_CMS_URL=https://app.storescore.io/api
   CLIENT_ID=<copy from backend/.env>
   CLIENT_SECRET=<copy from backend/.env>
   JWT_SECRET=<copy from backend/.env>
   JWT_EXPIRES_IN=7d
   ```
   
   > **Note**: Replace `your-vercel-app.vercel.app` with your actual Vercel URL

6. **Click "Create Web Service"** and wait 2-3 minutes

7. **Copy your backend URL**: `https://storescore-backend.onrender.com`

---

### Step 2: Update Vercel Frontend (2 minutes)

1. **Go to your Vercel dashboard**

2. **Select your StoreScore project**

3. **Go to Settings → Environment Variables**

4. **Add new variable**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://storescore-backend.onrender.com/api`
   - **Environments**: Check all (Production, Preview, Development)

5. **Click "Save"**

6. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### Step 3: Test the Connection (1 minute)

1. **Test backend health**:
   - Open: `https://storescore-backend.onrender.com/api/health`
   - Should see: `{"status": "OK", "message": "StoreScore Backend is running"}`

2. **Test frontend**:
   - Open your Vercel app
   - Try to login
   - Check browser console (F12) for any errors

---

## 🔧 If You Get CORS Errors

Your backend is already configured to accept requests from:
- ✅ All `*.vercel.app` domains (including preview deployments)
- ✅ Your specific frontend URL (via `FRONTEND_URL` env var)

If you still get CORS errors:
1. Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Redeploy the backend after changing env vars

---

## 💰 Alternative: Deploy Backend on Vercel

If you prefer to keep everything on Vercel:

1. **Create `vercel.json` in backend folder**:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```

2. **Deploy backend separately on Vercel**:
   - New Project → Same repo → Root Directory: `backend`

3. **Update frontend env var** with new backend URL

---

## 📝 Summary

**What you need to do:**
1. Deploy backend on Render (or Vercel)
2. Copy backend URL
3. Add `VITE_API_BASE_URL` to Vercel environment variables
4. Redeploy frontend

**That's it!** Your frontend and backend will be connected.

---

## 🆘 Need Help?

- **Backend not starting**: Check Render logs for errors
- **CORS errors**: Verify `FRONTEND_URL` matches your Vercel URL
- **API not responding**: Check if backend URL is correct in Vercel env vars
- **Cold starts**: Free Render apps sleep after 15 min - first request takes ~30s

For detailed troubleshooting, see `BACKEND_DEPLOYMENT.md`
