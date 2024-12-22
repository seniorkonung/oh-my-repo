#!/usr/bin/zsh

set -e

(
    cd /tmp
    git clone git@github.com:Jigsaw-Code/outline-sdk.git || true
    cd outline-sdk/x/examples
    go build -o outline -ldflags="-extldflags=-static" ./outline-cli
    mv -f ./outline $BIN_PATH
)

cat $OH_MY_REPO/secrets/outline-access-key.secret | ohgpg-decrypt >~/outline-access-key

sudo mkdir -p /etc/systemd/system
cat <<EOF | sudo tee /etc/systemd/system/outline.service
[Unit]
Description=Outline VPN
After=default.target

[Service]
ExecStart=zsh -c 'OUTLINE_KEY=\$(cat $HOME/outline-access-key); $BIN_PATH/outline -transport \$OUTLINE_KEY'

[Install]
WantedBy=default.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable outline.service
sudo systemctl start outline.service

# Outline Manager
(
    cd /tmp
    curl -OL https://github.com/seniorkonung/oh-my-repo/releases/download/OutlineManager/Outline-Manager.AppImage
    chmod u+x Outline-Manager.AppImage
    mv -f Outline-Manager.AppImage $BIN_PATH
)
