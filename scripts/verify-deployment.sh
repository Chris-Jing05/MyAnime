#!/bin/bash

# Verify deployment health checks

echo "==================================="
echo "MyAnime Deployment Verification"
echo "==================================="
echo ""

# Check if URLs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>"
    echo "Example: ./verify-deployment.sh https://api.example.com https://example.com"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=$2

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test Backend Health
echo "Testing Backend Health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api")

if [ "$BACKEND_STATUS" -eq 200 ] || [ "$BACKEND_STATUS" -eq 404 ]; then
    echo "✅ Backend is responding (HTTP $BACKEND_STATUS)"
else
    echo "❌ Backend is not responding (HTTP $BACKEND_STATUS)"
fi

# Test Frontend
echo ""
echo "Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" -eq 200 ]; then
    echo "✅ Frontend is responding (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend is not responding (HTTP $FRONTEND_STATUS)"
fi

# Test API Documentation
echo ""
echo "Testing API Documentation..."
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/docs")

if [ "$DOCS_STATUS" -eq 200 ]; then
    echo "✅ API Docs available at $BACKEND_URL/api/docs"
else
    echo "⚠️  API Docs not accessible"
fi

echo ""
echo "==================================="
echo "Verification Complete!"
echo "==================================="
