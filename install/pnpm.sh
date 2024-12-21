#!/usr/bin/zsh

set -e

curl -fsSL https://get.pnpm.io/install.sh | sh -

PNPM_HOME=$(zsh -c "source ~/.zshrc >/dev/null 2>&1; echo \$PNPM_HOME")
COMPLETION_FILE=~/.local/completion-for-pnpm.zsh

$PNPM_HOME/pnpm completion zsh >$COMPLETION_FILE
grep -q "source $COMPLETION_FILE" ~/.zshrc || echo "\nsource $COMPLETION_FILE" >>~/.zshrc
