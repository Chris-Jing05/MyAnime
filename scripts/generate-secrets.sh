#!/bin/bash

# Generate secure secrets for production deployment

echo "==================================="
echo "MyAnime Production Secrets Generator"
echo "==================================="
echo ""

echo "Copy these secrets to your deployment platform:"
echo ""

echo "JWT_SECRET=$(openssl rand -base64 32)"
echo ""

echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""

echo "==================================="
echo "IMPORTANT: Store these secrets securely!"
echo "Never commit these to version control."
echo "==================================="
