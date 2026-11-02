# Netlify Deployment Configuration

## Problem Fixed

When deploying a Single Page Application (SPA) like Angular to Netlify, directly accessing routes like `/profile`, `/create`, or `/listings` resulted in 404 errors. This is because:

1. Netlify serves static files from the `dist` folder
2. Routes like `/profile` don't correspond to physical files
3. Without proper configuration, Netlify returns 404 instead of serving `index.html`
4. Angular's client-side router never gets a chance to handle the route

## Solution Implemented

### 1. **netlify.toml** (Root level configuration)
This is the primary configuration file that Netlify reads automatically. It contains:

- **Redirect Rule**: All routes (`/*`) are redirected to `/index.html` with a 200 status
- **Build Command**: Specifies how to build the project (`npm run build`)
- **Publish Directory**: Points to the build output (`dist/renthub`)
- **Cache Headers**: Optimizes caching for different file types

### 2. **_redirects** (Backup method)
Located in the `public` folder, this file contains the same redirect rule in Netlify's alternative format:
```
/*    /index.html   200
```

This ensures compatibility if the netlify.toml is not detected.

## How It Works

1. User navigates to `https://renthubbasic.netlify.app/profile`
2. Netlify intercepts the request and sees it doesn't match a physical file
3. Netlify applies the redirect rule: `/* -> /index.html`
4. The browser receives `index.html` (the Angular app)
5. Angular's router parses the URL and displays the correct component

## Deployment Steps

1. **Push to Git** (if using Git-based deployment):
   ```bash
   git add netlify.toml public/_redirects
   git commit -m "Add Netlify SPA configuration"
   git push
   ```

2. **Redeploy on Netlify**:
   - Go to your Netlify dashboard
   - Trigger a new deployment
   - The new configuration will be applied automatically

3. **Verify**:
   - Visit `https://renthubbasic.netlify.app/profile` directly in the browser
   - Should now display the profile page instead of 404
   - Try other routes: `/create`, `/login`, `/favorites`

## Files Added/Modified

- ✅ `netlify.toml` (NEW) - Main Netlify configuration
- ✅ `public/_redirects` (NEW) - Backup redirect configuration
- ✅ `angular.json` (MODIFIED) - Updated to include _redirects in build output

## Testing Locally

The local development server (`npm start`) doesn't use these configurations, so routes work fine during development. The configuration only affects Netlify production deployments.

## References

- [Netlify Redirects Documentation](https://docs.netlify.com/routing/redirects/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
