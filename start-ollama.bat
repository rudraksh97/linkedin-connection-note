@echo off
REM Script to start Ollama with CORS enabled for browser extensions
REM This allows the LinkedIn Connection Note extension to access Ollama

echo 🤖 Starting Ollama with CORS enabled for browser extensions...
echo.
echo This will allow the LinkedIn Connection Note extension to access Ollama.
echo The server will be accessible at http://localhost:11434
echo.
echo To stop: Press Ctrl+C
echo.

REM Set environment variable to allow all origins (for browser extensions)
set OLLAMA_ORIGINS=*

REM Start Ollama
ollama serve 