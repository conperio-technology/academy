#!/bin/sh
# Pretend deploy: copies the site into a "server" folder and says so.
mkdir -p /tmp/deployed-site
cp index.html style.css /tmp/deployed-site/
echo "Deployed $(ls /tmp/deployed-site | wc -l) files to /tmp/deployed-site"
