#!/bin/bash
# init-deployment-link.sh - Setup deployment link for new projects

set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Error: Project name not provided"
  echo ""
  echo "Usage: ./init-deployment-link.sh <project-name>"
  echo "Example: ./init-deployment-link.sh my-new-project"
  exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
PROJECT_PATH="$REPO_ROOT/idea/$PROJECT_NAME"
DEPLOYMENTS_SOURCE="$REPO_ROOT/development/deployments"

echo "📍 Script directory: $SCRIPT_DIR"
echo "📍 Repo root: $REPO_ROOT"
echo "📍 Project path: $PROJECT_PATH"
echo "📍 Deployments source: $DEPLOYMENTS_SOURCE"
echo ""

# Check if project exists
if [ ! -d "$PROJECT_PATH" ]; then
  echo "❌ Error: Project folder not found: $PROJECT_PATH"
  echo ""
  echo "Available projects:"
  ls -1 "$REPO_ROOT/idea/" | grep -v "^\." || echo "  (No projects found)"
  exit 1
fi

# Check if deployments already exist
if [ -L "$PROJECT_PATH/deployments" ]; then
  echo "✅ Deployment link already exists"
  exit 0
fi

if [ -d "$PROJECT_PATH/deployments" ]; then
  echo "⚠️  Warning: $PROJECT_PATH/deployments already exists as a folder"
  echo "   You may want to remove it first: rm -rf $PROJECT_PATH/deployments"
  echo ""
  read -p "   Remove existing deployments folder? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$PROJECT_PATH/deployments"
  else
    echo "❌ Cancelled"
    exit 1
  fi
fi

# Create symlink
cd "$PROJECT_PATH"
ln -s ../../development/deployments ./deployments
echo "✅ Created symlink"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📁 Project structure:"
echo "   $PROJECT_PATH/deployments → ../../development/deployments"
echo ""
echo "🚀 Next steps:"
echo "   1. cd $PROJECT_PATH"
echo "   2. Choose deployment platform from: render, railway, vercel, heroku"
echo "   3. Follow the README.md in deployments/<platform>/"
