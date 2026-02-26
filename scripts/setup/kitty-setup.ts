#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "../utils.ts";

const INSTALLER_URL = "https://sw.kovidgoyal.net/kitty/installer.sh";
const INSTALLER_PATH = "/tmp/kitty-installer.sh";

const home = utils.getEnvVar("HOME");
const paths = {
  home,
  ohmyrepo: utils.getEnvVar("OH_MY_REPO"),
  kittyApp: `${home}/.local/kitty.app`,
  kittyBin: `${home}/.local/kitty.app/bin/kitty`,
  kittenBin: `${home}/.local/kitty.app/bin/kitten`,
  localBin: `${home}/.local/bin`,
  zshrc: `${home}/.zshrc`,
  kittyConf: `${home}/.config/kitty/kitty.conf`,
  xdgTerminals: `${home}/.config/xdg-terminals.list`,
};

async function kittyInstalled(): Promise<boolean> {
  return await utils.fileExists(paths.kittyBin);
}

async function downloadInstaller(): Promise<void> {
  utils.logStep("Загрузка установочного скрипта kitty");
  await utils.downloadFile(INSTALLER_URL, INSTALLER_PATH, { mode: "0755" });
  utils.logSuccess("Установочный скрипт загружен");
}

async function installKitty(): Promise<void> {
  if (await kittyInstalled()) {
    utils.logWarning("Kitty уже установлен");
    return;
  }

  utils.logStep("Установка kitty терминала");
  await $`${INSTALLER_PATH} launch=n`;
  utils.logSuccess("Kitty установлен");
}

async function addToPath(): Promise<void> {
  const pathLine = `export PATH=$PATH:${paths.kittyApp}/bin`;
  const added = await utils.appendLineToFile(paths.zshrc, pathLine);

  if (!added) {
    utils.logWarning("Kitty уже добавлен в PATH");
    return;
  }

  utils.logStep("Добавление kitty в PATH");
  utils.logSuccess("Kitty добавлен в PATH");
}

async function createSymlink(
  src: string,
  dest: string,
  name: string,
): Promise<void> {
  const created = await utils.createSymlink(src, dest);

  if (!created) {
    utils.logWarning(`Симлинк ${name} уже существует`);
    return;
  }

  utils.logStep(`Создание симлинка для ${name}`);
  utils.logSuccess(`Симлинк ${name} создан`);
}

async function copyDesktopFile(
  src: string,
  dest: string,
  name: string,
): Promise<void> {
  utils.logStep(`Копирование ${name}`);
  await utils.copyFile(src, dest, { createDir: true });
  utils.logSuccess(`${name} скопирован`);
}

async function fixDesktopFile(): Promise<void> {
  const desktopPath = `${paths.home}/.local/share/applications/kitty.desktop`;

  utils.logStep("Исправление путей в kitty.desktop");

  let content = await Deno.readTextFile(desktopPath);

  content = content.replace(
    /^Icon=kitty$/m,
    `Icon=${paths.kittyApp}/share/icons/hicolor/256x256/apps/kitty.png`,
  );
  content = content.replace(/^Exec=kitty$/m, `Exec=${paths.kittyBin}`);

  await Deno.writeTextFile(desktopPath, content);
  utils.logSuccess("Пути в kitty.desktop исправлены");
}

async function addToXdgTerminals(): Promise<void> {
  const line = "kitty.desktop";
  const added = await utils.appendLineToFile(paths.xdgTerminals, line, {
    createDir: true,
  });

  if (!added) {
    utils.logWarning("Kitty уже добавлен в xdg-terminals.list");
    return;
  }

  utils.logStep("Добавление kitty.desktop в xdg-terminals.list");
  utils.logSuccess("Kitty добавлен в xdg-terminals.list");
}

async function setupKittyConfig(): Promise<void> {
  const includeLine = `include ${paths.ohmyrepo}/kitty/kitty.conf`;
  const added = await utils.appendLineToFile(paths.kittyConf, includeLine, {
    createDir: true,
  });

  if (!added) {
    utils.logWarning("Конфигурация kitty уже подключена");
    return;
  }

  utils.logStep("Добавление импорта конфигурации kitty");
  utils.logSuccess("Конфигурация kitty подключена");
}

async function main(): Promise<void> {
  $.verbose = false;

  if (await kittyInstalled()) {
    utils.logWarning("Kitty уже установлен");
  } else {
    console.log(chalk.bold("\n🐱 Установка Kitty терминала\n"));

    try {
      await downloadInstaller();
      await installKitty();

      console.log(chalk.bold.green("\n✓ Установка Kitty завершена!\n"));
    } catch (error) {
      utils.logError("\n✗ Ошибка при установке:\n", error);
      Deno.exit(1);
    }
  }

  console.log(chalk.bold("\n⚙️  Настройка Kitty\n"));

  try {
    await addToPath();
    await createSymlink(paths.kittyBin, `${paths.localBin}/kitty`, "kitty");
    await createSymlink(paths.kittenBin, `${paths.localBin}/kitten`, "kitten");
    await copyDesktopFile(
      `${paths.kittyApp}/share/applications/kitty.desktop`,
      `${paths.home}/.local/share/applications/kitty.desktop`,
      "kitty.desktop",
    );
    await copyDesktopFile(
      `${paths.kittyApp}/share/applications/kitty-open.desktop`,
      `${paths.home}/.local/share/applications/kitty-open.desktop`,
      "kitty-open.desktop",
    );
    await fixDesktopFile();
    await addToXdgTerminals();
    await setupKittyConfig();

    console.log(chalk.bold.green("\n✓ Настройка Kitty завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при настройке:\n", error);
    Deno.exit(1);
  }
}

main();
