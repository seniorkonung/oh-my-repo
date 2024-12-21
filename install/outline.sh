#!/usr/bin/zsh

set -e

pushd /tmp

git clone https://github.com/Jigsaw-Code/outline-sdk.git || true
cd outline-sdk/x/examples
go build -o outline -ldflags="-extldflags=-static" ./outline-cli
mv ./outline $BIN_PATH

popd

cat $OH_MY_REPO/secrets/outline-access-key.secret | ohgpg-decrypt >~/outline-access-key

sudo mkdir -p /etc/systemd/system
cat <<EOF | sudo tee /etc/systemd/system/outline.service
[Unit]
Description=Outline VPN
After=default.target

[Service]
ExecStart=zsh -c '{ OUTLINE_KEY=\$(cat $HOME/outline-access-key); $BIN_PATH/outline -transport \$OUTLINE_KEY }'

[Install]
WantedBy=default.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable outline.service
sudo systemctl start outline.service
