#!/bin/bash

# Security Review - 2024
# REVIEWED: Authentication token handling
# RISK: High - Authentication tokens must never be hardcoded in source code
# MITIGATION: 
# 1. Moved token to environment variable
# 2. Added token presence validation
# 3. Added .env to .gitignore
# 4. Provided .env.example for documentation
# 5. Added input validation for environment variables
# STATUS: Secure when properly configured with environment variables

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Validate environment variables
if [ -z "$SONAR_TOKEN" ]; then
    echo "Error: SONAR_TOKEN environment variable is not set"
    echo "Please set it in .env file or export it in your environment"
    exit 1
fi

# Validate token format (basic format check)
if ! [[ $SONAR_TOKEN =~ ^[a-zA-Z0-9]+$ ]]; then
    echo "Error: SONAR_TOKEN contains invalid characters"
    echo "Token should only contain alphanumeric characters"
    exit 1
fi

# Project key
PROJECT_KEY="EyaJrah_flappy_clone"

# Validate project key
if [ -z "$PROJECT_KEY" ]; then
    echo "Error: PROJECT_KEY is not set"
    exit 1
fi

# Function to safely make API calls
make_api_call() {
    local endpoint=$1
    local output_file=$2
    
    # Validate URL format
    if ! [[ $endpoint =~ ^https://sonarcloud\.io/api/ ]]; then
        echo "Error: Invalid API endpoint"
        exit 1
    }
    
    # Make API call with proper error handling
    if ! curl -f -s -u "$SONAR_TOKEN:" "$endpoint" > "$output_file"; then
        echo "Error: API call failed for $output_file"
        exit 1
    fi
    
    echo "Data saved to $output_file"
}

# Get issues (vulnerabilities, code smells, etc.)
make_api_call "https://sonarcloud.io/api/issues/search?projectKeys=$PROJECT_KEY" "issues.json"

# Get quality gate status
make_api_call "https://sonarcloud.io/api/qualitygates/project_status?projectKey=$PROJECT_KEY" "quality_gate.json"

# Get coverage data
make_api_call "https://sonarcloud.io/api/measures/component?componentKey=$PROJECT_KEY&metricKeys=coverage" "coverage.json"

# Verify files were created
for file in issues.json quality_gate.json coverage.json; do
    if [ ! -f "$file" ]; then
        echo "Error: Failed to create $file"
        exit 1
    fi
done
