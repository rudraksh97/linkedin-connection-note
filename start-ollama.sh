#!/bin/bash

# Script to start Ollama with CORS enabled for browser extensions
# This allows the LinkedIn Connection Note extension to access Ollama

echo "🤖 Starting Ollama with CORS enabled for browser extensions..."
echo ""
echo "This will allow the LinkedIn Connection Note extension to access Ollama."
echo "The server will be accessible at http://localhost:11434"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Set environment variable to allow all origins (for browser extensions)
export OLLAMA_ORIGINS="*"

# Start Ollama
ollama serve 