#!/usr/bin/zsh

alias ohgpg-encrypt="gpg --yes --encrypt --recipient $GPGID"
alias ohgpg-decrypt="gpg -d -q"
alias ohgpg-public-key="gpg --export --armor $GPGID"
alias ohssh-keygen="ssh-keygen -t ed25519 -C $EMAIL"

alias ohzsh-clear-completion-cache="sudo rm ~/.zcompdump*"

alias repo="code $OH_MY_REPO"
alias myrepo="$OH_MY_REPO"
alias proj="mkdir -p ~/projects && cd ~/projects"
alias s="ohsession"
alias pass="ohkeepassxc"
alias tg="ohbackground telegram-desktop && exit"

alias vpn-start="sudo systemctl start outline.service"
alias vpn-status="sudo systemctl status outline.service"
alias vpn-stop="sudo systemctl stop outline.service"
alias vpn-manager="ohoutline-manager"

alias gdrive-start="systemctl --user start rclone-google-drive.service"
alias gdrive-status="systemctl --user status rclone-google-drive.service"
alias gdrive-stop="systemctl --user stop rclone-google-drive.service"

alias pn="pnpm"
alias en="trans -b en:ru"
alias ru="trans -b ru:en"
