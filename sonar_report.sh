#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
    echo "Error: SONAR_TOKEN environment variable is not set"
    echo "Please set it in .env file or export it in your environment"
    exit 1
fi

# Project key
PROJECT_KEY="EyaJrah_flappy_clone"

# Get issues (vulnerabilities, code smells, etc.)
curl -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?projectKeys=$PROJECT_KEY" > issues.json
echo "Issues saved to issues.json"

# Get quality gate status
curl -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/qualitygates/project_status?projectKey=$PROJECT_KEY" > quality_gate.json
echo "Quality Gate status saved to quality_gate.json"

# Get coverage data
curl -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/measures/component?componentKey=$PROJECT_KEY&metricKeys=coverage" > coverage.json
echo "Coverage data saved to coverage.json"
