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

function ruclip {
    echo $1 | ru | kitten clipboard
}

# Example: ohcert-gen localhost DNS:localhost IP:192.168.0.10
function ohcert-gen {
    local certs_dir=~/certs
    local certs_register_dir=/usr/local/share/ca-certificates
    local alt_names=$(
        args=($@)
        echo ${args[@]:1} | sed -r "s/^\s//" | sed -r "s/\s/,/g"
    )
    mkdir -p $certs_dir $certs_register_dir

    (
        cd ~/certs
        openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=$1" -addext "subjectAltName=$alt_names" -keyout "$1.key" -out "$1.crt"
        sudo ln ./$1.crt $certs_register_dir
        sudo update-ca-certificates
    )
}
