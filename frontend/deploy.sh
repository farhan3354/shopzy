#!/bin/bash

echo "Starting deployment..."

# Create and enable 4GB swap file (if not already present)
if ! swapon --show | grep -q '/swapfile'; then
  echo "Creating 4GB swapfile..."
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
else
  echo "Swapfile already active."
fi

# Navigate to your project folder
cd /home/ubuntu/kjs-frontend/onedigit-jewellery-ecommerce-frontend/frontend || exit

# Pull latest changes from production branch
git pull origin production

# Install dependencies if any have changed
npm install

# Build the production app with increased memory limit
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build

# Fix permissions on dist folder so Nginx can read files
sudo chown -R www-data:www-data ./dist
sudo chmod -R 755 ./dist

# Check if Nginx is active; start if not running
if ! sudo systemctl is-active --quiet nginx; then
  echo "Nginx is not running. Starting nginx..."
  sudo systemctl start nginx
else
  echo "Nginx is running."
fi

# Reload Nginx to serve updated files
sudo systemctl reload nginx

# Optional: Remove swapfile after build (uncomment to enable)
# sudo swapoff /swapfile
# sudo rm /swapfile

echo "Deployment finished!"
