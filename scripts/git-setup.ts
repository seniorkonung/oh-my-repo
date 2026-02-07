#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

const config = {
  fullname: utils.getEnvVar("FULLNAME"),
  email: utils.getEnvVar("EMAIL"),
  gpgid: utils.getEnvVar("GPGID"),
};

async function setGitConfig(key: string, value: string): Promise<void> {
  utils.logStep(`Установка ${key}`);
  await $`git config --global ${key} ${value}`;
  utils.logSuccess(`${key} установлен`);
}

async function enableGPGSign(): Promise<void> {
  utils.logStep("Включение подписи коммитов");
  await $`git config --global commit.gpgsign true`;
  utils.logSuccess("Подпись коммитов включена");
}

async function main(): Promise<void> {
  $.verbose = false;
  console.log(chalk.bold("\n🔧 Настройка Git конфигурации\n"));
  try {
    await setGitConfig("user.name", config.fullname);
    await setGitConfig("user.email", config.email);
    await setGitConfig("user.signingkey", config.gpgid);
    await enableGPGSign();

    console.log(chalk.bold.green("\n✓ Настройка Git завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при настройке:\n", error);
    Deno.exit(1);
  }
}

main();
