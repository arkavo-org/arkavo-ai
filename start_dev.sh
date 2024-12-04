if [ ! -d keys ]; then
  mkdir keys
  mkcert -cert-file ./keys/fullchain.pem -key-file ./keys/privkey.pem localhost
  chmod 644 ./keys/fullchain.pem ./keys/privkey.pem
fi

npm install
npm run dev
