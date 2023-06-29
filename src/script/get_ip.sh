#!/usr/bin/env sh

echo "Getting IP address..."
if (uname -a | grep -q Darwin); then
    LOCAL_IP=$(ipconfig getifaddr en0)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "IP address: $LOCAL_IP"

awk '{ if (NR == 7) print "'API_IP=${LOCAL_IP}'"; else print $0}' src/api/.env > src/.env.tmp
mv src/.env.tmp src/.env && rm -f src/.env.tmp && cp src/.env src/api/.env