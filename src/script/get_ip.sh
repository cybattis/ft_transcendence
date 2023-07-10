#!/usr/bin/env sh

echo "Getting IP address..."
  LOCAL_IP=$(curl -s ifconfig.me)

#LOCAL_IP=127.0.0.1

echo "IP address: $LOCAL_IP"

awk '{ if (NR == 13) print "'HOST_IP=${LOCAL_IP}'"; else print $0}' src/.env > src/.env.tmp
mv src/.env.tmp src/.300033env && rm -f src/.env.tmp