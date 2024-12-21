#!/usr/bin/zsh

set -e

sudo apt install -y zsh
sudo chsh -s $(which zsh)

touch ~/.zshrc
if ! grep -q "source $OH_MY_REPO/run.sh" ~/.zshrc; then
    echo "source $OH_MY_REPO/run.sh" >>~/.zshrc
fi

touch ~/.zshenv
if ! grep -q "source $OH_MY_REPO/env.sh" ~/.zshenv; then
    echo "source $OH_MY_REPO/env.sh" >>~/.zshenv
fi

sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

ZSH_CUSTOM_PLUGINS=~/.oh-my-zsh/custom/plugins

git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM_PLUGINS/zsh-autosuggestions || true
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM_PLUGINS/zsh-syntax-highlighting || true
git clone https://github.com/zsh-users/zsh-completions.git $ZSH_CUSTOM_PLUGINS/zsh-completions || true
