#!/bin/bash

# Ensure KEYCLOAK_SERVER_URL is set
if [ -z "$KEYCLOAK_SERVER_URL" ]; then
    echo "ERROR: KEYCLOAK_SERVER_URL is not set. Please export it before running the script."
    exit 1
fi

echo "Waiting for Keycloak at $KEYCLOAK_SERVER_URL to become healthy..."

# Wait for Keycloak health endpoint to return HTTP 200
until curl -s -o /dev/null -w "%{http_code}" "$KEYCLOAK_SERVER_URL/auth/health/live" | grep -q "200"; do
    sleep 5
    echo "Still waiting for Keycloak to become healthy..."
done

echo "Keycloak is healthy at $KEYCLOAK_SERVER_URL!"

# Start OpenTDF DB
docker compose -f docker-compose-opentdfdb.yaml up -d
docker run --rm --network arkavo curlimages/curl sh -c '
  echo "Waiting for OpenTDF DB to respond on opentdfdb:5432...";
  until curl -s "http://opentdfdb:5432" >/dev/null 2>&1; do
    sleep 5;
    echo "Still waiting for OpenTDF DB to accept connections on port 5432...";
  done;
  echo "OpenTDF DB is accepting connections on opentdfdb:5432!";
'


# Start OpenTDF
docker compose -f docker-compose-opentdf.yaml up -d
echo "Waiting for OpenTDF to start and listen on port 8080..."

# Wait for OpenTDF to be listening on port 8080
until nc -z localhost 8080; do
    sleep 5
    echo "Still waiting for OpenTDF to be up..."
done

echo "OpenTDF is up and listening on port 8080!"

