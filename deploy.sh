#!/bin/bash
set -u
set -e

RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`

SERVER_NAME="external.simpleanalytics.com"
DIST_PATH='./dist'
REMOTE_PATH='app@external.simpleanalytics.com:/var/www/default'

if ! [[ $PWD = */embed ]] || ! [[ -f "./dist/embed.js" ]]; then
  echo -e "==> ${RED}Not in embed directory, killing script${RESET}"
  exit 1
fi

seconds=$(date +%S)
if [[ $seconds -gt 40 ]]; then
  echo "==> It is $seconds seconds and the build changes soon, run right after a new minute"
  exit 1
fi

if [[ `git status --porcelain` ]]; then
  echo -e "==> ${RED}There are changes in your repo, commit and test them first${RESET}"
  exit 1
fi

echo "==> You are about to deploy to $SERVER_NAME"
read -p "==> Are you sure (y/N)? "  -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo '==> Minifying one more time'

  npm run build

  if [[ `git status --porcelain` ]]; then
    echo -e "==> ${RED}There are changes in your repo, commit and test them first${RESET}"
    exit 1
  fi

  echo "==> Deploying embed files to $SERVER_NAME"
  # rsync --rsync-path="sudo rsync" "$DIST_PATH/embed.js" "$REMOTE_PATH/embed.js"
  # rsync --rsync-path="sudo rsync" "$DIST_PATH/embed.js.map" "$REMOTE_PATH/embed.js.map"

  echo -e "==> ${GREEN}Woop woop! Deployed to $SERVER_NAME!${RESET}"
else
  echo '==> Cancelled by you'
fi
