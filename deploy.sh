#!/bin/bash
set -o pipefail -e

RED=`tput setaf 1`
GREEN=`tput setaf 2`
RESET=`tput sgr0`

SERVER_NAME="external.simpleanalytics.com"
DIST_PATH='./dist'
REMOTE_PATH='app@external.simpleanalytics.com:/var/www/default'

error_exit()
{
    echo "Error: $1"
    exit 1
}

set +o pipefail +e
nonDist1=$(git diff --cached --name-only | grep -v '^dist/' | wc -l)
nonDist2=$(git ls-files --modified | grep -v '^dist/' | wc -l)
nonDist=$(expr $nonDist1 + $nonDist2)
set -o pipefail -e

if [ $nonDist -gt 0 ]; then
  echo -e "==> ${RED}There are (non build) changes in your repo, commit and test them first${RESET}"
  exit 1
fi

if ! [[ $PWD = */embed ]] || ! [[ -f "./dist/embed.js" ]]; then
  echo -e "==> ${RED}Not in embed directory, killing script${RESET}"
  exit 1
fi

echo "==> You are about to deploy to $SERVER_NAME"
read -p "==> Are you sure (y/N)? "  -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo '==> Minifying one more time'

  npm run build

  set +o pipefail +e
  dist1=$(git diff --cached --name-only dist/ | wc -l)
  dist2=$(git ls-files --modified dist/ | wc -l)
  dist=$(expr $dist1 + $dist2)

  if [ $dist -gt 0 ]; then
    git reset HEAD .
    git add dist/
    git commit -m "Run 'npm run build'\nFrom /deploy.sh script"
  fi

  nonDist1=$(git diff --cached --name-only | grep -v '^dist/' | wc -l)
  nonDist2=$(git ls-files --modified | grep -v '^dist/' | wc -l)
  nonDist=$(expr $nonDist1 + $nonDist2)
  set -o pipefail -e

  if [ $nonDist -gt 0 ]; then
    echo -e "==> ${RED}There are (non build) changes in your repo, commit and test them first${RESET}"
    exit 1
  fi

  echo "==> Deploying embed files to $SERVER_NAME"
  rsync --rsync-path="sudo rsync" "$DIST_PATH/embed.js" "$REMOTE_PATH/embed.js"
  rsync --rsync-path="sudo rsync" "$DIST_PATH/embed.js.map" "$REMOTE_PATH/embed.js.map"

  echo -e "==> ${GREEN}Woop woop! Deployed to $SERVER_NAME!${RESET}"
else
  echo '==> Cancelled by you'
fi
