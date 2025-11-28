#!/bin/sh
set -e

APP_DIR=/usr/src/app
cd "$APP_DIR"

echo "Generating pm2 ecosystem for services..."
TMP=/tmp/pm2_apps_$$.tmp
: > "$TMP"

for d in services/* microservicios/*; do
  if [ -f "$d/package.json" ]; then
    name=$(basename "$d")
    # prefer starting the compiled JS if available, else fallback to `npm start`
    if [ -f "$d/dist/main.js" ]; then
      start_cmd="node dist/main.js"
      exec_interpreter="node"
      exec_mode="fork"
    elif [ -f "$d/dist/index.js" ]; then
      start_cmd="node dist/index.js"
      exec_interpreter="node"
      exec_mode="fork"
    else
      start_cmd="npm start"
      exec_interpreter="node"
      exec_mode="fork"
    fi
    cat >> "$TMP" <<EAPP
{
  name: "$name",
  cwd: "$APP_DIR/$d",
  script: "$start_cmd",
  env: { NODE_ENV: "production" }
},
EAPP
  fi
done

# Remove trailing comma from last entry
sed '$s/,$//' "$TMP" > /tmp/pm2_apps_final.tmp

cat > ecosystem.config.js <<'ECO'
module.exports = {
  apps: [
ECO

cat /tmp/pm2_apps_final.tmp >> ecosystem.config.js

cat >> ecosystem.config.js <<'ECO'
  ]
}
ECO

rm -f "$TMP" /tmp/pm2_apps_final.tmp

echo "Starting processes with pm2-runtime..."
exec pm2-runtime ecosystem.config.js
