#!/bin/bash

# SonarCloud token and project key
SONAR_TOKEN="8f9a5fdf5cba790605ab6ed398b091086c10b2fa"
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
