#/usr/bin/env bash

# Copy specific line from .env file to client/.env.local file
file="src/.env"
rm -f src/client/.env.local
touch src/client/.env.local

echo "Creating client/.env.local file..."

while IFS= read -r varname; do
    if [[ $varname == "CLIENT_PORT"* || $varname == "PROTOCOL"* \
      || $varname == "API_UID"* || $varname == "API_PORT"* \
      || $varname == "HOST_IP"* ]]; then
          echo "REACT_APP_$varname" >> src/client/.env.local
    elif [[ $varname == "API_URL"* ]]; then
          echo 'REACT_APP_API_URL=${REACT_APP_PROTOCOL}://${REACT_APP_HOST_IP}:${REACT_APP_API_PORT}/auth/42' >> src/client/.env.local
    elif [[ $varname == "REDIR_URL"* ]]; then
          echo 'REACT_APP_REDIR_URL=https://api.intra.42.fr/oauth/authorize?client_id=${REACT_APP_API_UID}&redirect_uri=${REACT_APP_API_URL}&response_type=code&scope=public' >> src/client/.env.local
    fi
done < "$file"

echo "Done."