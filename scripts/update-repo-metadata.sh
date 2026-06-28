#!/bin/bash

# Update BlogSpace Repository Metadata
# This script updates the GitHub repository description and topics via the REST API
# Usage: ./scripts/update-repo-metadata.sh <github-token>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: GitHub token required"
    echo "Usage: ./scripts/update-repo-metadata.sh <github-token>"
    echo ""
    echo "To generate a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy and use the token"
    exit 1
fi

GITHUB_TOKEN=$1
OWNER="mmhammaden"
REPO="blogspace"
API_URL="https://api.github.com/repos/${OWNER}/${REPO}"

echo "📝 Updating repository metadata for ${OWNER}/${REPO}..."
echo ""

# Update description
echo "🔄 Updating description..."
curl -s -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "description": "A production-ready full-stack blogging platform with React 18, Node.js, Express, TypeScript, and PostgreSQL. Features JWT auth, role-based access, rich text editor with React Quill, comments, reactions, and full-text search."
  }' \
  "${API_URL}" > /dev/null

echo "✅ Description updated"
echo ""

# Update topics via GraphQL (REST API for topics has limitations)
echo "🔄 Updating topics..."
cat > /tmp/update-topics.graphql << 'EOF'
mutation UpdateTopics($repositoryId: ID!, $topicNames: [String!]!) {
  updateTopics(input: {
    repositoryId: $repositoryId
    topicNames: $topicNames
  }) {
    repository {
      name
      topics(first: 20) {
        nodes {
          topic {
            name
          }
        }
      }
    }
  }
}
EOF

# Get repository node ID first
REPO_NODE_ID=$(curl -s \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "${API_URL}" | grep '"node_id"' | head -1 | sed 's/.*"node_id": "\([^"]*\)".*/\1/')

if [ -z "$REPO_NODE_ID" ]; then
    echo "❌ Failed to get repository node ID"
    exit 1
fi

echo "   Repository Node ID: $REPO_NODE_ID"

# Define topics
TOPICS='[
  "react",
  "typescript",
  "nodejs",
  "express",
  "postgresql",
  "prisma",
  "tailwindcss",
  "jwt-authentication",
  "full-stack",
  "blogging-platform"
]'

# Update topics via GraphQL
curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation UpdateTopics(\\\$repositoryId: ID!, \\\$topicNames: [String!]!) { updateTopics(input: {repositoryId: \\\$repositoryId, topicNames: \\\$topicNames}) { repository { name topics(first: 20) { nodes { topic { name } } } } } }\",
    \"variables\": {
      \"repositoryId\": \"${REPO_NODE_ID}\",
      \"topicNames\": ${TOPICS}
    }
  }" \
  "https://api.github.com/graphql" > /tmp/topics-response.json

# Check for errors
if grep -q '"errors"' /tmp/topics-response.json; then
    echo "❌ Failed to update topics:"
    cat /tmp/topics-response.json | grep -o '"message":"[^"]*"'
    exit 1
fi

echo "✅ Topics updated successfully"
echo ""

# Display final metadata
echo "📊 Final repository metadata:"
curl -s \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "${API_URL}" | grep -E '"description"|"topics"' | head -5

echo ""
echo "✨ Repository metadata update complete!"
echo ""
echo "📍 View at: https://github.com/${OWNER}/${REPO}"
