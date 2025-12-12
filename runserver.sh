#!/bin/bash

PORT=5500
DIR="./"
BIND="0.0.0.0"

echo "Starting Python HTTP server on port  ..."
python3 -m http.server $PORT --directory "$DIR" --bind "$BIND" 