#!/usr/bin/zsh

function ohbackground {
    nohup $@ >/dev/null 2>&1 &
    disown
}

function ohkeepassxc {
    ohbackground zsh -c "ohgpg-decrypt $OH_MY_REPO/secrets/master.secret | keepassxc --pw-stdin ~/gdrive/all.kdbx"
}

alias ohgpg-encrypt="gpg --yes --encrypt --recipient $GPGID"
alias ohgpg-decrypt="gpg -d -q"
alias ohgpg-public-key="gpg --export --armor $GPGID"
alias ohssh-keygen="ssh-keygen -t ed25519 -C $EMAIL"

alias repo="code $OH_MY_REPO"
alias s="code ~/projects/oohey/.vscode/oohey.code-workspace && cd ~/projects/oohey"
alias pass="ohkeepassxc"
alias airepo="code ~/.claude"
alias aijson="code ~/.claude.json"

alias gdrive-start="systemctl --user start rclone-google-drive.service"
alias gdrive-status="systemctl --user status rclone-google-drive.service"
alias gdrive-stop="systemctl --user stop rclone-google-drive.service"
alias gdrive-restart="systemctl --user restart rclone-google-drive.service"
alias gdrive-refresh="rclone config reconnect senior.konung: && gdrive-restart"

alias pn="pnpm"
alias px="pnpm dlx"
alias pne="pnpm exec"
alias pnr="pnpm run"

alias m="mise"
alias mr="mise run"
alias mu="mise use"
alias mconf="code ~/.config/mise/config.toml"