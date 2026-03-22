#!/bin/bash
# Serve the site at http://127.0.0.1:8000 — press Ctrl+C to stop
cd "$(dirname "$0")"
echo "Opening http://127.0.0.1:8000"
echo "Press Ctrl+C to stop the server."
python3 -m http.server 8000 --bind 127.0.0.1
