#!/usr/bin/zsh

fpath=($OH_MY_REPO/completions $fpath)
fpath=($ZSH/custom/plugins/zsh-completions/src $fpath)

ZSH_THEME="agnoster"
ZSH_AUTOSUGGEST_STRATEGY="completion"

plugins=(
    git
    zsh-syntax-highlighting
    zsh-autosuggestions
    zsh-completions
    rust
    nvm
    node
    npm
    react-native
    zsh-interactive-cd
)

source $ZSH/oh-my-zsh.sh
