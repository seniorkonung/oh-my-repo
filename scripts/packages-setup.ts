#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

const PACKAGES = [
  "curl",
  "unzip",
  "ca-certificates",
  "openjdk-17-jdk",
  "gnome-shell-extension-prefs",
  "gnome-shell-extension-gsconnect",
] as const;

async function updateAptCache(): Promise<void> {
  utils.logStep("Обновление кэша apt");
  await $`sudo apt-get update -qq`;
  utils.logSuccess("Кэш обновлен");
}

async function installPackage(pkg: string): Promise<boolean> {
  utils.logStep(`Установка ${pkg}`);

  try {
    await $`sudo apt-get install -y ${pkg} -qq`;
    utils.logSuccess(`${pkg} установлен`);
    return true;
  } catch (error) {
    utils.logError(`Не удалось установить ${pkg}`, error);
    return false;
  }
}

async function installPackages(): Promise<void> {
  utils.logStep(`Установка ${PACKAGES.length} пакетов`);

  let successCount = 0;
  for (const pkg of PACKAGES) {
    if (await installPackage(pkg)) {
      successCount++;
    }
  }

  if (successCount === PACKAGES.length) {
    utils.logSuccess("Все пакеты установлены");
  } else if (successCount > 0) {
    utils.logWarning(`Установлено ${successCount} из ${PACKAGES.length} пакетов`);
  } else {
    utils.logError("Не удалось установить ни одного пакета");
  }
}

async function main(): Promise<void> {
  $.verbose = false;
  console.log(chalk.bold("\n📦 Установка системных пакетов\n"));

  try {
    await updateAptCache();
    await installPackages();
    console.log(chalk.bold.green("\n✓ Установка пакетов завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при установке пакетов:\n", error);
    Deno.exit(1);
  }
}

main();
