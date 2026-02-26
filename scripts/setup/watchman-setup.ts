#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write --allow-net
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "../utils.ts";

const home = utils.getEnvVar("HOME");
const paths = {
  home,
  watchman: `${home}/.local/watchman`,
  watchmanTar: "/tmp/watchman.tar.gz",
  localBin: `${home}/.local/bin`,
};

async function watchmanInstalled(): Promise<boolean> {
  return await utils.fileExists(paths.watchman);
}

async function getLatestWatchmanVersion(): Promise<string> {
  utils.logStep("Получение информации о последней версии Watchman");

  const response = await fetch(
    "https://api.github.com/repos/facebook/watchman/releases/latest",
  );
  const data = await response.json();

  const assetUrl = data.assets[0].browser_download_url;
  utils.logSuccess(`Найдена версия: ${data.tag_name}`);

  return assetUrl;
}

async function downloadWatchman(): Promise<void> {
  const url = await getLatestWatchmanVersion();

  utils.logStep("Загрузка Watchman");
  await utils.downloadFile(url, paths.watchmanTar);
  utils.logSuccess("Watchman загружен");
}

async function extractWatchman(): Promise<string> {
  utils.logStep("Распаковка архива");
  const dir = await utils.extractTarGz(paths.watchmanTar, {
    pattern: "watchman-*-linux",
  });
  utils.logSuccess("Архив распакован");
  return dir;
}

async function installWatchman(): Promise<void> {
  await downloadWatchman();
  const extractedDir = await extractWatchman();

  utils.logStep("Установка Watchman в ~/.local/watchman");
  await $`mv ${extractedDir} ${paths.watchman}`;
  utils.logSuccess("Watchman установлен");
}

async function createDirectories(): Promise<void> {
  utils.logStep("Создание необходимых директорий");

  const dirs = [
    "/usr/local/bin",
    "/usr/local/lib",
    "/usr/local/var/run/watchman",
  ];

  for (const dir of dirs) {
    await utils.createDirectory(dir, { sudo: true });
  }

  utils.logSuccess("Директории созданы");
}

async function createSymlinks(): Promise<void> {
  utils.logStep("Создание символических ссылок");

  await $`sudo cp -rsf ${paths.watchman}/bin/. /usr/local/bin`;
  await $`sudo cp -rsf ${paths.watchman}/lib/. /usr/local/lib`;

  utils.logSuccess("Символические ссылки созданы");
}

async function fixLiblzma(): Promise<void> {
  const dest = "/usr/local/lib/liblzma.so.5";
  const src = "/usr/lib/x86_64-linux-gnu/liblzma.so.5";

  utils.logStep("Настройка системной библиотеки liblzma.so");
  await utils.createSymlinkForce(src, dest, { sudo: true });
  utils.logSuccess("Библиотека liblzma.so настроена");
}

async function setPermissions(): Promise<void> {
  utils.logStep("Настройка прав доступа");

  await utils.setPermissions("/usr/local/var/run/watchman", "2777", {
    sudo: true,
  });
  await utils.setPermissions("/usr/local/bin/watchman", "0755", { sudo: true });

  utils.logSuccess("Права доступа настроены");
}

async function main(): Promise<void> {
  $.verbose = false;

  if (await watchmanInstalled()) {
    utils.logWarning("Watchman уже установлен");
    return;
  }

  console.log(chalk.bold("\n👁️  Установка Watchman\n"));

  try {
    await installWatchman();
    await createDirectories();
    await createSymlinks();
    await fixLiblzma();
    await setPermissions();

    console.log(chalk.bold.green("\n✓ Установка Watchman завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке:\n", error);
    Deno.exit(1);
  }
}

main();
