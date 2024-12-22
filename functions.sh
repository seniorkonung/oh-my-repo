#!/usr/bin/zsh

function ohbackground {
    nohup $@ >/dev/null 2>&1 &
    disown
}

function ohsession {
    ohbackground kitty --session $OH_MY_REPO/kitty/sessions/$1
    exit
}

function ohkeepassxc {
    ohbackground zsh -c "ohgpg-decrypt $OH_MY_REPO/secrets/master.secret | keepassxc --pw-stdin ~/gdrive/all.kdbx"
    exit
}

function ohoutline-manager {
    ohbackground Outline-Manager.AppImage --no-sandbox
    exit
}

function ohssh-copy {
    ssh-copy-id -i $SSH_KEY_PATH $1@$2
}
