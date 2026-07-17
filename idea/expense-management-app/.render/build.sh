#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building web..."
cd web
npm run build
cd ..

echo "Build completed successfully!"
