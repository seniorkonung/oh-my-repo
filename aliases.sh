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
alias vpn-lan="sudo ip route add 192.168.0.0/24 dev $(ip route | grep default | awk '{print $5}') proto kernel scope link src $(ip route | grep default | awk '{print $9}') table local"
alias vpn-manager="ohoutline-manager"

alias gdrive-start="systemctl --user start rclone-google-drive.service"
alias gdrive-status="systemctl --user status rclone-google-drive.service"
alias gdrive-stop="systemctl --user stop rclone-google-drive.service"
alias gdrive-restart="systemctl --user restart rclone-google-drive.service"
alias gdrive-refresh="rclone config reconnect senior.konung: && gdrive-restart"

alias pn="pnpm"
alias px="pnpm dlx"
alias pn-clear="rm -rf node_modules **/node_modules** pnpm-lock.yaml"

alias en="trans -b en:ru"
alias ru="trans -b ru:en"
