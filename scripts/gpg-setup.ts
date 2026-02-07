#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

const ohmyrepo = utils.getEnvVar("OH_MY_REPO");
const gpgid = utils.getEnvVar("GPGID");
const gpgPrivateKeyPath = `${ohmyrepo}/secrets/gpg-private-key.secret`;

async function hasGpgKey(): Promise<boolean> {
  const result = await $`gpg --list-secret-keys ${gpgid} 2>/dev/null`.quiet();
  return result.stdout.includes("sec");
}

async function importGpgKey(): Promise<void> {
  utils.logStep("Импорт приватного GPG ключа");

  const cmd = `
    set -o pipefail &&
    gpg -d -q ${gpgPrivateKeyPath} | gpg --import &&
    (
      echo trust &
      echo 5 &
      echo y &
      echo quit
    ) | gpg --command-fd 0 --edit-key ${gpgid}
  `;

  await $`bash -c ${cmd}`;
  utils.logSuccess("GPG ключ импортирован");
}

async function setupGpg(): Promise<void> {
  if (await hasGpgKey()) {
    utils.logWarning("GPG ключ уже установлен");
    return;
  }

  if (!(await utils.fileExists(gpgPrivateKeyPath))) {
    utils.logError(`Файл ${gpgPrivateKeyPath} не найден`);
    Deno.exit(1);
  }

  await importGpgKey();
}

async function main(): Promise<void> {
  $.verbose = false;
  console.log(chalk.bold("\n🔐 Настройка GPG\n"));

  try {
    await setupGpg();
    console.log(chalk.bold.green("\n✓ Настройка GPG завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при настройке GPG:\n", error);
    Deno.exit(1);
  }
}

main();
