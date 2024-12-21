#!/usr/bin/zsh

set -e

pushd /tmp

curl -O https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip -o rclone-current-linux-amd64.zip

pushd rclone-*-linux-amd64

cp --force rclone $BIN_PATH
chmod 755 $BIN_PATH

popd
popd

COMPLETION_FILE=~/.local/completion-for-rclone.zsh

rclone completion zsh $COMPLETION_FILE
grep -q "source $COMPLETION_FILE" ~/.zshrc || echo "\nsource $COMPLETION_FILE" >>~/.zshrc

RCLONE_CONFIG_FILE=$(rclone config file | sed '1d')

mkdir -p $(dirname $RCLONE_CONFIG_FILE)
ohgpg-decrypt $OH_MY_REPO/secrets/rclone-conf.secret >$RCLONE_CONFIG_FILE

mkdir -p ~/.config/systemd/user ~/gdrive >/dev/null 2>&1 || true
cat <<EOF >~/.config/systemd/user/rclone-google-drive.service
[Unit]
Description=Mounting google drive using rclone
After=default.target

[Service]
ExecStart=$(which rclone) mount senior.konung: $HOME/gdrive
ExecStop=umount -l $HOME/gdrive

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable rclone-google-drive.service
systemctl --user start rclone-google-drive.service
