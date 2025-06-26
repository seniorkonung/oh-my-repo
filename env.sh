#!/usr/bin/zsh

export OH_MY_REPO=$(dirname $(realpath $0))
export GPGID="425C78F2BA2BBAA7"
export EMAIL="senior.konung@gmail.com"

export BIN_PATH=~/.local/bin
export SSH_KEY_PATH=~/.ssh/id_ed25519

export PATH=$PATH:$BIN_PATH
export PATH=$PATH:/usr/local/go/bin

export ZSH=~/.oh-my-zsh

source $OH_MY_REPO/aliases.sh
source $OH_MY_REPO/functions.sh
