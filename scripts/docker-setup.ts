#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

async function checkDocker(): Promise<boolean> {
  const result = await $`docker -v`.quiet().nothrow();
  return result.exitCode === 0;
}

async function addGPGKey(): Promise<void> {
  const keyringPath = "/etc/apt/keyrings/docker.asc";

  if (await utils.fileExists(keyringPath)) {
    utils.logWarning("GPG ключ уже существует");
    return;
  }

  utils.logStep("Добавление GPG-ключа Docker");
  await $`sudo install -m 0755 -d /etc/apt/keyrings`;
  await $`sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o ${keyringPath}`;
  await $`sudo chmod a+r ${keyringPath}`;
  utils.logSuccess("GPG-ключ добавлен");
}

async function addRepository(): Promise<void> {
  const repoPath = "/etc/apt/sources.list.d/docker.list";

  if (await utils.fileExists(repoPath)) {
    utils.logWarning("Репозиторий уже добавлен");
    return;
  }

  utils.logStep("Добавление репозитория Docker");

  const arch = (await $`dpkg --print-architecture`).stdout.trim();
  const codename = (
    await $`. /etc/os-release && echo $VERSION_CODENAME`
  ).stdout.trim();

  const repoEntry =
    `deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${codename} stable`;

  await $`echo ${repoEntry} | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`;
  utils.logSuccess("Репозиторий добавлен");
}

async function installDocker(): Promise<void> {
  utils.logStep("Установка Docker Engine");
  await $`sudo apt-get update`;
  await $`sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`;
  utils.logSuccess("Docker установлен");
}

async function main(): Promise<void> {
  $.verbose = false;

  if (await checkDocker()) {
    utils.logWarning("Docker уже установлен");
    return;
  }

  console.log(chalk.bold("\n🐳 Установка Docker\n"));

  try {
    await addGPGKey();
    await addRepository();
    await installDocker();

    console.log(chalk.bold.green("\n✓ Установка Docker завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке:\n", error);
    Deno.exit(1);
  }
}

main();
