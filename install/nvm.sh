#!/usr/bin/zsh

set -e

rm -rf $NVM_DIR

(
  git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR"
  cd "$NVM_DIR"
  git checkout $(git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1))
) && \. "$NVM_DIR/nvm.sh"

NVM_RUNNER='[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"'
grep -q $NVM_RUNNER ~/.zshrc || echo "\n$NVM_RUNNER" >>~/.zshrc
