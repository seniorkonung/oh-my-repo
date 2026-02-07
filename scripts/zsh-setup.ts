#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write --allow-net
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

const home = utils.getEnvVar("HOME");
const user = utils.getEnvVar("USER");
const ohmyrepo = utils.getEnvVar("OH_MY_REPO");
const paths = {
  home,
  user,
  ohmyrepo,
  ohMyZsh: `${home}/.oh-my-zsh`,
  zshrc: `${home}/.zshrc`,
  zshenv: `${home}/.zshenv`,
  customPlugins: `${home}/.oh-my-zsh/custom/plugins`,
};

async function isZshDefault(): Promise<boolean> {
  const result = await $`echo $SHELL`;
  return result.stdout.trim() === "/usr/bin/zsh";
}

async function installZsh(): Promise<void> {
  utils.logStep("Установка zsh");
  await $`sudo apt-get install -y zsh`;
  utils.logSuccess("Zsh установлен");
}

async function setZshAsDefault(): Promise<void> {
  if (await isZshDefault()) {
    utils.logWarning("Zsh уже установлен как оболочка по умолчанию");
    return;
  }

  utils.logStep("Установка zsh как оболочки по умолчанию");
  await $`sudo chsh -s /usr/bin/zsh ${paths.user}`;
  utils.logSuccess("Zsh установлен как оболочка по умолчанию");
}

async function ensureZshFilesExist(): Promise<void> {
  utils.logStep("Создание файлов конфигурации zsh");

  await $`touch ${paths.zshrc}`;
  await utils.setPermissions(paths.zshrc, "0644");

  await $`touch ${paths.zshenv}`;
  await utils.setPermissions(paths.zshenv, "0644");

  utils.logSuccess("Файлы конфигурации созданы");
}

async function installOhMyZsh(): Promise<void> {
  if (await utils.fileExists(paths.ohMyZsh)) {
    utils.logWarning("Oh-my-zsh уже установлен");
    return;
  }

  utils.logStep("Установка oh-my-zsh");
  await $`
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  `;
  utils.logSuccess("Oh-my-zsh установлен");
}

async function installPlugin(
  name: string,
  repo: string,
): Promise<void> {
  const dest = `${paths.customPlugins}/${name}`;

  if (await utils.fileExists(dest)) {
    utils.logWarning(`Плагин ${name} уже установлен`);
    return;
  }

  utils.logStep(`Установка плагина ${name}`);
  await utils.gitClone(repo, dest);
  utils.logSuccess(`Плагин ${name} установлен`);
}

async function installPlugins(): Promise<void> {
  await utils.createDirectory(paths.customPlugins);

  await installPlugin(
    "zsh-autosuggestions",
    "https://github.com/zsh-users/zsh-autosuggestions",
  );
  await installPlugin(
    "zsh-completions",
    "https://github.com/zsh-users/zsh-completions",
  );
  await installPlugin(
    "zsh-syntax-highlighting",
    "https://github.com/zsh-users/zsh-syntax-highlighting",
  );
}

const ZSHRC_BLOCK = `
fpath=(${paths.customPlugins}/zsh-completions/src $fpath)

ZSH_THEME="agnoster"
ZSH_AUTOSUGGEST_STRATEGY="completion"

plugins=(
  git
  zsh-syntax-highlighting
  zsh-autosuggestions
  zsh-completions
  rust
  node
  npm
  bun
  dockers
  zsh-interactive-cd
  mise
)

source ${paths.ohMyZsh}/oh-my-zsh.sh
`;

async function setupZshrc(): Promise<void> {
  utils.logStep("Настройка .zshrc");

  const content = await Deno.readTextFile(paths.zshrc);

  if (content.includes("fpath=") && content.includes("ZSH_THEME=")) {
    utils.logWarning("Конфигурация oh-my-zsh уже добавлена в .zshrc");
    return;
  }

  await Deno.writeTextFile(paths.zshrc, content + ZSHRC_BLOCK);
  utils.logSuccess(".zshrc настроен");
}

async function setupZshenv(): Promise<void> {
  utils.logStep("Настройка .zshenv");

  const utilsLine = `source ${paths.ohmyrepo}/utils.sh`;
  const ohMyRepoLine = `export OH_MY_REPO=${paths.ohmyrepo}`;

  const content = await Deno.readTextFile(paths.zshenv);

  if (!content.includes(utilsLine)) {
    await $`echo ${utilsLine} >> ${paths.zshenv}`;
  }

  if (!content.includes(ohMyRepoLine)) {
    await $`echo ${ohMyRepoLine} >> ${paths.zshenv}`;
  }

  utils.logSuccess(".zshenv настроен");
}

async function main(): Promise<void> {
  $.verbose = false;

  console.log(chalk.bold("\n🐚 Установка Zsh и Oh-my-zsh\n"));

  try {
    await installZsh();
    await setZshAsDefault();
    await ensureZshFilesExist();
    await installOhMyZsh();
    await installPlugins();
    await setupZshrc();
    await setupZshenv();

    console.log(chalk.bold.green("\n✓ Установка Zsh завершена!\n"));
    console.log(
      chalk.yellow(
        "Выйдите из системы и войдите снова, чтобы изменения вступили в силу.",
      ),
    );
    console.log();
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке:\n", error);
    Deno.exit(1);
  }
}

main();
