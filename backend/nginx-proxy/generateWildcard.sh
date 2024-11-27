docker run --rm -it \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly \
  --manual --preferred-challenges dns \
  -d arkavo.org -d *.arkavo.org

