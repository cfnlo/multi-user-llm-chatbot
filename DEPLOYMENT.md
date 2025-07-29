# Deployment Guide

## Quick Deploy to Railway

1. Push this code to GitHub
2. Go to [railway.app](https://railway.app) and sign up
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Set these environment variables in Railway:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_MODEL`: gpt-4o-mini
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production

## Environment Variables Required

```env
OPENAI_API_KEY=sk-proj-...your-key-here
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=production
PORT=3001
```

## Alternative Platforms

- **Render**: render.com (free tier available)
- **Heroku**: heroku.com (paid after free tier)
- **Vercel**: vercel.com (for static sites, requires modifications)

## Production URLs

Once deployed, your app will be available at:
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`

The invitation system will automatically use the production URL for email invites.