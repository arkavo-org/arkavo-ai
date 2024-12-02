#!/bin/bash

# Get the last two levels of the directory structure
PARENT_DIR=$(basename "$(dirname "$PWD")")
CURRENT_DIR=$(basename "$PWD")
export CONTAINER_NAME="${PARENT_DIR}-${CURRENT_DIR}"
echo "CONTAINER NAME $CONTAINER_NAME"

# Start the Docker Compose stack
docker network inspect arkavo >/dev/null 2>&1 || docker network create arkavo

# run the HTTPS proxy
docker run -d \
  --name arkavo-dev-nginx \
  --network arkavo \
  --rm \
  -p 3001:443 \
  -v "$(pwd)/nginx.conf:/etc/nginx/nginx.conf" \
  -v "/etc/letsencrypt/live/arkavo.org/fullchain.pem:/keys/fullchain.pem" \
  -v "/etc/letsencrypt/live/arkavo.org/privkey.pem:/keys/privkey.pem" \
  nginx

