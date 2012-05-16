#!/bin/bash
ID=$(echo $RANDOM | base64)
APPCACHE=subv.appcache
sed -i "s/VERSION: \[[^\]*]/VERSION: [${ID}]/" ${APPCACHE}
