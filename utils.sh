#!/usr/bin/zsh

function ohbackground {
    nohup $@ >/dev/null 2>&1 &
    disown
}

function ohsession {
    kitty --detach --session $OH_MY_REPO/kitty/sessions/$1
    exit
}

function ohkeepassxc {
    ohbackground zsh -c "ohgpg-decrypt $OH_MY_REPO/secrets/master.secret | keepassxc --pw-stdin ~/gdrive/all.kdbx"
}

function ohcert-gen {
    if [[ $# < 2 ]]; then
        echo "Example: ohcert-gen localhost DNS:localhost IP:192.168.0.10"
        return 1
    fi

    local certs_dir=~/certs
    local certs_register_dir=/usr/local/share/ca-certificates
    local alt_names=$(
        args=($@)
        echo ${args:1} | sed -r "s/\s/,/g"
    )
    mkdir -p $certs_dir $certs_register_dir

    (
        cd ~/certs
        openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=$1" -addext "subjectAltName=$alt_names" -keyout "$1.key" -out "$1.crt"
        sudo ln ./$1.crt $certs_register_dir
        sudo update-ca-certificates
    )
}

alias ohgpg-encrypt="gpg --yes --encrypt --recipient $GPGID"
alias ohgpg-decrypt="gpg -d -q"
alias ohgpg-public-key="gpg --export --armor $GPGID"
alias ohssh-keygen="ssh-keygen -t ed25519 -C $EMAIL"

alias ohzsh-clear-completion-cache="sudo rm ~/.zcompdump*"

alias repo="code $OH_MY_REPO"
alias s="ohsession"
alias pass="ohkeepassxc"
alias zshrc="code ~/.zshrc"

alias gdrive-start="systemctl --user start rclone-google-drive.service"
alias gdrive-status="systemctl --user status rclone-google-drive.service"
alias gdrive-stop="systemctl --user stop rclone-google-drive.service"
alias gdrive-restart="systemctl --user restart rclone-google-drive.service"
alias gdrive-refresh="rclone config reconnect senior.konung: && gdrive-restart"

alias pn="pnpm"
alias px="pnpm dlx"
alias pn-clear="rm -rf node_modules **/node_modules** pnpm-lock.yaml"
