#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

const home = utils.getEnvVar("HOME");
const ohmyrepo = utils.getEnvVar("OH_MY_REPO");
const paths = {
  home,
  ohmyrepo,
  rcloneZip: "/tmp/rclone.zip",
  rcloneBin: `${home}/.local/bin/rclone`,
  localBin: `${home}/.local/bin`,
  gdrive: `${home}/gdrive`,
  systemdUser: `${home}/.config/systemd/user`,
  rcloneService: `${home}/.config/systemd/user/rclone-google-drive.service`,
};

async function rcloneInstalled(): Promise<boolean> {
  return await utils.fileExists(paths.rcloneBin);
}

async function downloadRclone(): Promise<void> {
  const url = "https://downloads.rclone.org/rclone-current-linux-amd64.zip";

  utils.logStep("Загрузка rclone");
  await utils.downloadFile(url, paths.rcloneZip);
  utils.logSuccess("Rclone загружен");
}

async function extractRclone(): Promise<string> {
  utils.logStep("Распаковка архива");
  const dir = await utils.extractZip(paths.rcloneZip, {
    pattern: "rclone-*-linux-amd64",
  });
  utils.logSuccess("Архив распакован");
  return dir;
}

async function installRclone(): Promise<void> {
  if (await rcloneInstalled()) {
    utils.logWarning("Rclone уже установлен");
    return;
  }

  await downloadRclone();
  const extractedDir = await extractRclone();

  utils.logStep("Установка rclone в ~/.local/bin");
  await utils.createDirectory(paths.localBin);
  await utils.copyFile(`${extractedDir}/rclone`, paths.rcloneBin, {
    mode: "0755",
  });
  utils.logSuccess("Rclone установлен");
}

async function getRcloneConfigPath(): Promise<string> {
  const result = await $`rclone config file`;
  // rclone config file выводит путь на второй строке
  const lines = result.stdout.trim().split("\n");
  return lines[1];
}

async function setupRcloneConfig(): Promise<void> {
  utils.logStep("Настройка конфигурации rclone");

  const configPath = await getRcloneConfigPath();
  const secretPath = `${paths.ohmyrepo}/secrets/rclone-conf.secret`;

  utils.logStep("Расшифровка конфигурации rclone");
  const result = await $`gpg -d -q ${secretPath}`;

  await Deno.writeTextFile(configPath, result.stdout.trim());
  await utils.setPermissions(configPath, "0644");
  utils.logSuccess("Конфигурация rclone установлена");
}

async function createGdriveMount(): Promise<void> {
  const created = await utils.fileExists(paths.gdrive);

  if (created) {
    utils.logWarning("Директория для монтирования Google Drive уже существует");
    return;
  }

  utils.logStep("Создание директории для монтирования Google Drive");
  await utils.createDirectory(paths.gdrive, { mode: "0755" });
  utils.logSuccess("Директория создана");
}

async function createSystemdService(): Promise<void> {
  utils.logStep("Создание systemd unit для rclone");

  await utils.createDirectory(paths.systemdUser);

  const serviceContent = `[Unit]
Description=Mounting google drive using rclone
After=default.target

[Service]
ExecStart=${paths.rcloneBin} mount senior.konung: ${paths.gdrive}
ExecStop=umount -l ${paths.gdrive}

[Install]
WantedBy=default.target`;

  await Deno.writeTextFile(paths.rcloneService, serviceContent);
  await utils.setPermissions(paths.rcloneService, "0644");
  utils.logSuccess("Systemd unit создан");
}

async function enableAndStartService(): Promise<void> {
  utils.logStep("Включение автозапуска rclone-google-drive.service");
  await $`systemctl --user daemon-reload`;
  await $`systemctl --user enable rclone-google-drive.service`;
  await $`systemctl --user start rclone-google-drive.service`;
  utils.logSuccess("Rclone-google-drive.service запущен");
}

async function main(): Promise<void> {
  $.verbose = false;

  console.log(chalk.bold("\n☁️  Установка Rclone\n"));

  try {
    await installRclone();
    await setupRcloneConfig();
    await createGdriveMount();
    await createSystemdService();
    await enableAndStartService();

    console.log(chalk.bold.green("\n✓ Установка Rclone завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке:\n", error);
    Deno.exit(1);
  }
}

main();
