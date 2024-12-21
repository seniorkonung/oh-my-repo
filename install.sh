#!/usr/bin/zsh

set -e

ohgpg-decrypt $OH_MY_REPO/secrets/gpg-private-key.secret | gpg --import
(
    echo trust &
    echo 5 &
    echo y &
    echo quit
) | gpg --command-fd 0 --edit-key $GPGID

ohgpg-decrypt $OH_MY_REPO/secrets/ssh-private-key.secret >$SSH_KEY_PATH && sudo ssh-keygen -y -f $SSH_KEY_PATH >$SSH_KEY_PATH.pub
chmod 600 $SSH_KEY_PATH

sudo apt update
sudo apt install -y curl fzf tldr

source $OH_MY_REPO/install/zsh.sh
source $OH_MY_REPO/install/kitty.sh
source $OH_MY_REPO/install/git.sh
source $OH_MY_REPO/install/nvm.sh
source $OH_MY_REPO/install/ngrok.sh
source $OH_MY_REPO/install/golang.sh
source $OH_MY_REPO/install/outline.sh
source $OH_MY_REPO/install/docker.sh
source $OH_MY_REPO/install/rust.sh
source $OH_MY_REPO/install/pnpm.sh
source $OH_MY_REPO/install/rclone.sh
