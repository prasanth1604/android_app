#!/bin/bash

set -e  # Exit if any command fails

echo "🐍 Setting up Django backend..."

pip install -r requirements.txt

cd reward_platform

python manage.py makemigrations

python manage.py migrate

python manage.py runserver

echo "✅ Django backend ready."

echo "🛠️  Building React frontend..."

cd frontend
npm install react react-router-dom axios cors
npm install
npm run dev
cd ..

echo "✅ React build complete."

# rm -rf backend/static/*
# cp -r frontend/dist/* backend/static/


