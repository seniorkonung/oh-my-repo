#!/usr/bin/zsh

set -e

sudo apt install -y git

git config --global user.name "Valentin Panchenko"
git config --global user.email "senior.konung@gmail.com"
git config --global user.signingkey $GPGID
git config --global commit.gpgsign true
