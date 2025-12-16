#!/bin/bash

echo "Starting backend deployment..."

# Navigate to backend folder
cd /home/ubuntu/kjs-backend-server/onedigit-jewellery-ecommerce-backend/backend || exit

# Pull latest code from GitHub main branch
git pull origin production

# Install any new dependencies
npm install

# Restart backend using pm2, if not running start it
pm2 restart backend || pm2 start index.js --name backend

echo "Backend deployment finished!"
