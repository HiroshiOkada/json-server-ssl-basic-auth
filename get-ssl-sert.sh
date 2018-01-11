#!/bin/bash

FDQN=json-server.toycode.com
EMAIL=okadahiroshi@miobox.jp

if [ ${EUID:-${UID}} -ne 0 ]; then
  echo 'this script must run as root'
fi

/usr/bin/letsencrypt certonly \
  --standalone \
  --standalone-supported-challenges http-01 \
  --domain ${FDQN} \
  --email ${EMAIL} \
  --agree-tos \
  --non-interactive

PWD_OWNER=$(stat -c '%u:%g' ${PWD})
mkdir -p ${PWD}/cert
chown ${PWD_OWNER} ${PWD}/cert

for fname in cert.pem chain.pem fullchain.pem privkey.pem; do
  cp /etc/letsencrypt/live/${FDQN}/${fname} ${PWD}/cert
  chown ${PWD_OWNER} ${PWD}/cert/${fname}
done

