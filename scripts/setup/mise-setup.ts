#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "../utils.ts";

const home = utils.getEnvVar("HOME");
const paths = {
  home,
  miseBin: `${home}/.local/bin/mise`,
  localBin: `${home}/.local/bin`,
  zshrc: `${home}/.zshrc`,
};

async function miseInstalled(): Promise<boolean> {
  return await utils.fileExists(paths.miseBin);
}

async function installMise(): Promise<void> {
  utils.logStep("Установка mise");
  const oldShell = $.shell;
  $.shell = "/bin/bash";
  await $`set -o pipefail && curl https://mise.run | sh`;
  $.shell = oldShell;
  utils.logSuccess("Mise установлен");
}

async function createGlobalSymlink(): Promise<void> {
  const dest = "/usr/local/bin/mise";

  if (await utils.fileExists(dest)) {
    utils.logWarning("Глобальная символическая ссылка на mise уже существует");
    return;
  }

  utils.logStep("Создание глобальной символической ссылки для mise");
  await $`sudo ln -s ${paths.miseBin} ${dest}`;
  utils.logSuccess("Глобальная символическая ссылка создана");
}

async function enableAutocompletions(): Promise<void> {
  utils.logStep("Включение автодополнений для mise");
  await $`mise use -g usage`;
  utils.logSuccess("Автодополнения включены");
}

async function addToZshrc(): Promise<void> {
  const line = 'eval "$(~/.local/bin/mise activate zsh)"';
  const added = await utils.appendLineToFile(paths.zshrc, line);

  if (!added) {
    utils.logWarning("Активация mise уже добавлена в .zshrc");
    return;
  }

  utils.logStep("Добавление активации mise в .zshrc");
  utils.logSuccess("Активация mise добавлена в .zshrc");
}

async function main(): Promise<void> {
  $.verbose = false;

  if (await miseInstalled()) {
    utils.logWarning("Mise уже установлен");
    console.log(chalk.bold("\n🔧 Настройка Mise\n"));

    try {
      await createGlobalSymlink();
      await enableAutocompletions();
      await addToZshrc();

      console.log(chalk.bold.green("\n✓ Настройка Mise завершена!\n"));
    } catch (error) {
      utils.logError("\n✗ Ошибка при настройке:\n", error);
      Deno.exit(1);
    }
    return;
  }

  console.log(chalk.bold("\n🔧 Установка Mise\n"));

  try {
    await installMise();
    await createGlobalSymlink();
    await enableAutocompletions();
    await addToZshrc();

    console.log(chalk.bold.green("\n✓ Установка Mise завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке:\n", error);
    Deno.exit(1);
  }
}

main();
