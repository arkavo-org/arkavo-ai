#!/bin/bash

# Start Keycloak
docker compose -f docker-compose-keycloak.yaml up -d
echo "Waiting for Keycloak to become healthy..."
# Wait for the service to stop (indicating completion)
until [ "`docker inspect -f {{.State.Status}} opentdf_provision`" == "exited" ]; do
    sleep 5;
done
echo "Keycloak is healthy and provisioned!"

# Start OpenTDF DB
docker compose -f docker-compose-opentdfdb.yaml up -d
echo "Waiting for OpenTDF DB to become healthy..."
until [ "`docker inspect -f {{.State.Health.Status}} opentdfdb`" == "healthy" ]; do
    sleep 5;
done
echo "OpenTDF DB is healthy!"

# Start OpenTDF
docker compose -f docker-compose-opentdf.yaml up -d
echo "Waiting for OpenTDF to start and listen on port 8080..."

# Wait for OpenTDF to be listening on port 8080
until nc -z localhost 8080; do   
    sleep 5
    echo "Still waiting for OpenTDF to be up..."
done

echo "OpenTDF is up and listening on port 8080!"