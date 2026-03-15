#!/bin/bash
echo "🌵 Bora dar um grau nessa bagunça, patrões!"
find . -name "*.log" -type f -delete 2>/dev/null
npm cache clean --force 2>/dev/null
echo "✨ VPS limpa e levinha!"
