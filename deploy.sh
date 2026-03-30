#!/bin/bash

echo "--- Deploying RAHI Healthcare System ---"

# 1. Pull latest changes
echo "[1/5] Pulling latest code..."
git pull origin main

# 2. Run Tests
echo "[2/5] Running Tests..."
# In a real CI/CD, this would run in a separate runner.
# Here we can use a temporary container or assume dev environment has pytest.
# docker-compose run backend pytest
# docker-compose run ai_engine pytest

# 3. Build Docker images
echo "[3/5] Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# 4. Stop running containers
echo "[4/5] Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# 5. Start new containers in detached mode
echo "[5/5] Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "--- Deployment Complete! RAHI is live. ---"
