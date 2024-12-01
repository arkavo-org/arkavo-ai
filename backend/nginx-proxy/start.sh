# Ensure the network exists
docker network inspect arkavo >/dev/null 2>&1 || docker network create arkavo

# Run the container
docker run -d \
  --name nginx-proxy \
  --network arkavo \
  --rm \
  -v "$(pwd)/conf/nginx.conf:/etc/nginx/nginx.conf" \
  -v "$(pwd)/ssl:/etc/nginx/ssl" \
  -v "$(pwd)/html:/usr/share/nginx/html" \
  -v "/etc/letsencrypt/live/arkavo.org/fullchain.pem:/keys/fullchain.pem" \
  -v "/etc/letsencrypt/live/arkavo.org/privkey.pem:/keys/privkey.pem" \
  -p 80:80 \
  -p 443:443 \
  nginx:latest

