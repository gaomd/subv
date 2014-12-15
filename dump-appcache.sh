#!/bin/bash
ID=$(git log --pretty=format:'%h' -n 1)
TMP_FILE=`mktemp /tmp/config.XXXXXXXXXX`
sed -e "s/^# VERSION: .*$/# VERSION: ${ID}/" subv.appcache > $TMP_FILE
mv $TMP_FILE subv.appcache
