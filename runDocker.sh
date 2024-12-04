#!/bin/bash

# Get the last two levels of the directory structure
PARENT_DIR=$(basename "$(dirname "$PWD")")
CURRENT_DIR=$(basename "$PWD")
export CONTAINER_NAME="${PARENT_DIR}-${CURRENT_DIR}"
echo "CONTAINER NAME $CONTAINER_NAME"

# Start the Docker Compose stack
docker network inspect arkavo >/dev/null 2>&1 || docker network create arkavo

docker run -d \
  --name "frontend_${CONTAINER_NAME}" \
  --network arkavo \
  --rm \
  -v "$(pwd):/usr/src/app" \
  -w /usr/src/app \
  -p "${FRONTEND_PORT}:5173" \
  -e NODE_ENV=development \
  -e VITE_KEYCLOAK_SERVER_URL="${VITE_KEYCLOAK_SERVER_URL}" \
  -e VITE_KEYCLOAK_REALM="${VITE_KEYCLOAK_REALM}" \
  -e VITE_KEYCLOAK_CLIENT_ID="${VITE_KEYCLOAK_CLIENT_ID}" \
  -e VITE_ORG_BACKEND_URL="${VITE_ORG_BACKEND_URL}" \
  -e VITE_KAS_ENDPOINT="${VITE_KAS_ENDPOINT}" \
  node:22 \
  sh -c "npm install && npm run dev"

