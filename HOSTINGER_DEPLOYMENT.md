# 🚀 Hostinger Deployment Guide

## Option 1: VPS Hosting (Recommended)

### Prerequisites
- Hostinger VPS plan (starting ~$3.99/month)
- SSH access to your VPS
- Domain/subdomain configured

### Step-by-Step Deployment

#### 1. Connect to Your VPS
```bash
ssh root@your-vps-ip
```

#### 2. Update System and Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 3. Clone and Deploy Your App
```bash
# Clone your repository
git clone https://github.com/nourhb/dm0-elearning.git
cd dm0-elearning

# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "elearning" -- start
pm2 startup
pm2 save
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/elearning
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-subdomain.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configure SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-subdomain.yourdomain.com
```

## Option 2: Shared Hosting (Static Export)

### Prerequisites
- Hostinger shared hosting plan
- FTP access
- Domain/subdomain configured

### Step-by-Step Deployment

#### 1. Build Static Files Locally
```bash
# Clone your repository locally
git clone https://github.com/nourhb/dm0-elearning.git
cd dm0-elearning

# Install dependencies
npm install

# Build static files
npm run build
```

#### 2. Upload to Hostinger
1. **Connect via FTP** to your Hostinger hosting
2. **Navigate to** `public_html` folder
3. **Upload all contents** from the `out/` folder to `public_html/`

#### 3. Configure Domain
1. **Go to Hostinger Control Panel**
2. **Navigate to Domains** → Your Domain
3. **Add subdomain** pointing to `public_html`

#### 4. Environment Variables
Since static export doesn't support server-side features, you'll need to:
- Move API calls to external services
- Use client-side Firebase configuration
- Configure environment variables in Hostinger's control panel

## Option 3: Hybrid Approach (Recommended for Shared Hosting)

### Frontend on Shared Hosting + Backend on VPS

#### 1. Deploy Backend API on VPS
```bash
# On your VPS, create API-only deployment
git clone https://github.com/nourhb/dm0-elearning.git
cd dm0-elearning

# Create API-only build
npm install
npm run build

# Start API server
pm2 start npm --name "elearning-api" -- start
```

#### 2. Deploy Frontend on Shared Hosting
```bash
# Locally, build static frontend
npm run build:static

# Upload out/ folder to shared hosting
```

#### 3. Configure API Endpoints
Update your frontend to point to your VPS API:
```javascript
// In your frontend code
const API_BASE_URL = 'https://your-vps-ip:3000/api';
```

## 🔧 Environment Variables Setup

### For VPS Deployment
Create `.env` file on your VPS:
```bash
nano .env
```

Add your environment variables:
```env
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### For Shared Hosting
Add environment variables in Hostinger's control panel:
1. **Go to Advanced** → **Environment Variables**
2. **Add each variable** with its value

## 📁 File Structure After Deployment

### VPS Deployment
```
/root/dm0-elearning/
├── .next/
├── node_modules/
├── public/
├── src/
├── package.json
└── .env
```

### Shared Hosting (Static Export)
```
public_html/
├── _next/
├── api/
├── locales/
├── index.html
└── [other static files]
```

## 🔄 Automatic Deployment

### For VPS: GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /root/dm0-elearning
            git pull
            npm install
            npm run build
            pm2 restart elearning
```

## 🚨 Important Notes

### For Static Export:
- ❌ **No server-side API routes**
- ❌ **No server-side rendering**
- ❌ **No dynamic imports**
- ✅ **Faster loading**
- ✅ **Better SEO**
- ✅ **Lower hosting costs**

### For VPS Deployment:
- ✅ **Full Next.js features**
- ✅ **API routes work**
- ✅ **Server-side rendering**
- ❌ **Higher cost**
- ❌ **More maintenance**

## 🆘 Troubleshooting

### Common Issues:

1. **Port 3000 not accessible**
   ```bash
   # Check if port is open
   sudo ufw allow 3000
   ```

2. **PM2 not starting on reboot**
   ```bash
   pm2 startup
   pm2 save
   ```

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Static files not loading**
   - Check file permissions
   - Verify upload path
   - Clear browser cache

## 📞 Support

If you encounter issues:
1. Check Hostinger's documentation
2. Review Next.js deployment guides
3. Check server logs: `pm2 logs elearning`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
