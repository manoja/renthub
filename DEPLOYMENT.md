# RentHub - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying RentHub to various hosting platforms. The application is deployed at:

**🌐 Live URL: https://renthubbasic.netlify.app/**

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development
- [ ] Environment variables configured
- [ ] Angular CLI updated: `npm install -g @angular/cli@latest`
- [ ] All features tested locally

---

## 🔧 Build Optimization

### Production Build Command
```bash
npm run build
```

**Output:** `dist/renthub/` folder

### Build Configuration
```json
{
  "outputPath": "dist/renthub",
  "optimization": true,
  "sourceMap": false,
  "namedChunks": false,
  "aot": true
}
```

### Build Features
- ✅ Ahead-of-Time (AOT) compilation
- ✅ Code minification
- ✅ Tree shaking
- ✅ Source maps disabled
- ✅ Production optimization

---

## 🌐 Deployment Options

### Option 1: Netlify Deployment (RECOMMENDED)

#### Prerequisites
- GitHub account with code pushed
- Netlify account (free tier available)

#### Step 1: Connect GitHub Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose "GitHub"
4. Select your repository
5. Click "Connect"

#### Step 2: Configure Build Settings
1. **Build command:** `npm run build`
2. **Publish directory:** `dist/renthub`
3. Click "Deploy site"

#### Step 3: Custom Domain (Optional)
1. Go to Site settings
2. Click "Change site name"
3. Enter desired name (e.g., renthubbasic)
4. Or add custom domain

#### Step 4: Environment Variables (if needed)
1. Go to Site settings → Build & deploy → Environment
2. Add any environment variables
3. Click "Save"

#### Automatic Deployments
- Every push to main branch triggers deployment
- Builds take 2-3 minutes
- Automatic SSL certificate

---

### Option 2: Vercel Deployment

#### Step 1: Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Choose "From Git"
4. Select GitHub repository

#### Step 2: Configure
1. **Framework:** Angular
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist/renthub`
4. Click "Deploy"

#### Step 3: Access Deployment
- Default URL: `https://renthub.vercel.app`
- Auto-deploys on every push
- Preview deployments for PRs

---

### Option 3: GitHub Pages

#### Step 1: Update angular.json
```json
{
  "projects": {
    "renthub": {
      "architect": {
        "build": {
          "options": {
            "baseHref": "/renthub/",
            "outputPath": "dist/renthub"
          }
        }
      }
    }
  }
}
```

#### Step 2: Build
```bash
ng build --configuration production --base-href=/renthub/
```

#### Step 3: Deploy to gh-pages Branch
```bash
npm install -g angular-cli-ghpages
ngh --dir=dist/renthub
```

#### Step 4: Enable GitHub Pages
1. Go to repository settings
2. Scroll to "GitHub Pages"
3. Select "gh-pages" branch
4. Save

**URL:** `https://username.github.io/renthub`

---

### Option 4: AWS S3 + CloudFront

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://renthub-app
```

#### Step 2: Upload Build Files
```bash
aws s3 sync dist/renthub s3://renthub-app --delete
```

#### Step 3: Enable Static Website Hosting
1. Go to S3 bucket properties
2. Enable "Static website hosting"
3. Set index document to `index.html`
4. Set error document to `index.html`

#### Step 4: Create CloudFront Distribution
1. Go to CloudFront
2. Create distribution
3. Point to S3 bucket
4. Configure caching

**URL:** `https://d111.cloudfront.net`

---

## 🔐 Production Configuration

### Environment Variables
Create `.env.production`:
```env
PRODUCTION=true
API_BASE_URL=https://api.renthub.com
```

### Security Headers (Netlify)
Create `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📊 Deployment Verification

### Test Deployed Site
1. Visit deployment URL
2. Test key features:
   - Login/Register
   - Create property
   - Search and filter
   - Favorites
   - Contact owner modal
   - Profile page

### Performance Testing
- Use Lighthouse audit
- Check Core Web Vitals
- Monitor load times
- Test on 3G network

### Error Monitoring
- Check browser console
- Monitor Network tab
- Verify API calls
- Test forms

---

## 🔄 Continuous Deployment (CD)

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist/renthub'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
          enable-pull-request-comment: true
          enable-commit-comment: true
          overwrites-pull-request-comment: false
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🛠 Troubleshooting

### Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 Errors on Page Refresh
**Issue:** Angular routing doesn't work on refresh
**Solution:** Configure server to route all requests to index.html

**Netlify:** Add `_redirects` file:
```
/*    /index.html    200
```

### Images Not Loading
**Issue:** Base64 data URLs causing issues
**Solution:** Check DomSanitizer implementation in components

### localStorage Not Working
**Issue:** Data not persisting
**Solution:** Check browser storage settings and privacy mode

### Slow Performance
**Solution:**
1. Enable compression
2. Optimize images
3. Use CDN
4. Implement caching headers

---

## 📈 Post-Deployment

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user analytics
- Set up alerts for errors

### Maintenance
- Regular security updates
- Dependency updates
- Backup data
- Test recovery procedures

### Analytics Setup
Add Google Analytics to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] No console errors
- [ ] Feature testing complete

### Deployment
- [ ] Choose hosting platform
- [ ] Connect repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy

### Post-Deployment
- [ ] Verify live site works
- [ ] Test all features
- [ ] Check performance
- [ ] Set up monitoring
- [ ] Configure domain

---

## 🔗 Deployment Links

| Platform | URL | Status |
|----------|-----|--------|
| Netlify | https://renthubbasic.netlify.app | ✅ Live |
| GitHub Repo | [Your Repo URL] | Code |

---

## 🆘 Support

For deployment issues:
1. Check platform documentation
2. Review error logs
3. Check browser console
4. Verify build locally first

---

**Last Updated:** October 2026
**Angular Version:** 20.3.0
