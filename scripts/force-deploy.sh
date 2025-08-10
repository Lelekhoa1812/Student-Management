#!/bin/bash

echo "🚀 Forcing fresh Vercel deployment..."

# Clear Vercel cache
echo "🧹 Clearing Vercel cache..."
vercel --clear-cache

# Force a new build
echo "🔨 Building fresh deployment..."
vercel --build-env NODE_ENV=production

# Deploy with force flag
echo "📤 Deploying with force flag..."
vercel --force

echo "✅ Fresh deployment completed!"
echo "📝 Check your Vercel dashboard for the new deployment"
echo "🔍 The PDF generation should now use the updated Vietnamese font handling"
