#!/bin/bash
set -e

echo "🚀 Installing dependencies for Puppeteer..."
apt-get update && apt-get install -y wget gnupg

echo "📥 Downloading Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
apt-get update && apt-get install -y google-chrome-stable

echo "✅ Google Chrome Installed Successfully!"
