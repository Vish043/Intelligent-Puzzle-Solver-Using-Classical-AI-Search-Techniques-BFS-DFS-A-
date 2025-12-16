# Deploying to Render

This guide will help you deploy the Intelligent Puzzle Solver to Render.

## Prerequisites

1. A GitHub account
2. A Render account (free at [render.com](https://render.com))
3. Your code pushed to a GitHub repository

## Deployment Steps

### Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and deploy

#### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `puzzle-solver` (or any name you prefer)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn puzzle_solver:app`
   - **Instance Type**: Free tier is sufficient

5. Click "Create Web Service"

### Step 3: Environment Variables (Optional)

Render will automatically:
- Set `PORT` environment variable
- Use production mode

You can optionally add:
- `FLASK_ENV=production` (already set in render.yaml)

### Step 4: Wait for Deployment

- Render will build and deploy your application
- First deployment takes 2-5 minutes
- You'll get a URL like: `https://puzzle-solver.onrender.com`

### Step 5: Access Your Application

Once deployed, visit your Render URL:
- Main app: `https://YOUR-APP-NAME.onrender.com`
- Health check: `https://YOUR-APP-NAME.onrender.com/health`
- API endpoint: `https://YOUR-APP-NAME.onrender.com/solve`

## Files for Deployment

The following files are required for Render deployment:

- ✅ `puzzle_solver.py` - Main application (updated for production)
- ✅ `requirements.txt` - Python dependencies (includes gunicorn)
- ✅ `Procfile` - Start command for Render
- ✅ `render.yaml` - Render configuration (optional but recommended)
- ✅ `index.html` - Frontend HTML
- ✅ `style.css` - Frontend styling
- ✅ `script.js` - Frontend JavaScript

## Troubleshooting

### Build Fails

1. Check build logs in Render dashboard
2. Ensure all dependencies are in `requirements.txt`
3. Verify Python version compatibility

### Application Crashes

1. Check runtime logs in Render dashboard
2. Verify `gunicorn` is installed: `pip install gunicorn`
3. Ensure `app` is defined at module level in `puzzle_solver.py`

### CORS Errors

- CORS is already configured in the code
- If issues persist, check that `flask-cors` is in requirements.txt

### Static Files Not Loading

- Verify routes in `puzzle_solver.py` serve static files correctly
- Check file names match exactly (case-sensitive)

## Free Tier Limitations

Render's free tier has:
- ⏱️ Services spin down after 15 minutes of inactivity
- 🚀 First request after spin-down takes ~30 seconds
- 💾 512MB RAM limit
- ⚡ Sufficient for this puzzle solver application

## Updating Your Deployment

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```

2. Render will automatically detect changes and redeploy
3. Monitor deployment in Render dashboard

## Custom Domain (Optional)

1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain and follow DNS configuration instructions

## Support

For issues:
- Check Render logs in dashboard
- Review [Render Documentation](https://render.com/docs)
- Check application logs for errors

---

**Note**: The application will work perfectly on Render's free tier. The puzzle solver is lightweight and doesn't require persistent storage.

