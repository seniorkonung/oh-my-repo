#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run --allow-write
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "../utils.ts";

const home = utils.getEnvVar("HOME");
const ohmyrepo = utils.getEnvVar("OH_MY_REPO");
const sshPrivateKeyPath = `${ohmyrepo}/secrets/ssh-private-key.secret`;
const sshPublicKeyPath = `${home}/.ssh/id_ed25519.pub`;
const sshPrivateKeyDest = `${home}/.ssh/id_ed25519`;

async function getEncryptedSshKey(): Promise<string> {
  if (!(await utils.fileExists(sshPrivateKeyPath))) {
    utils.logError(`Файл ${sshPrivateKeyPath} не найден`);
    Deno.exit(1);
  }

  const result = await $`gpg -d -q ${sshPrivateKeyPath}`;
  return result.stdout.trim();
}

async function setupSshPrivateKey(): Promise<void> {
  if (await utils.fileExists(sshPrivateKeyDest)) {
    utils.logWarning("SSH приватный ключ уже существует");
    return;
  }

  utils.logStep("Сохранение приватного SSH ключа");

  await utils.createDirectory(`${home}/.ssh`, { mode: "0700" });

  const privateKey = await getEncryptedSshKey();
  await Deno.writeTextFile(sshPrivateKeyDest, privateKey + "\n");
  await utils.setPermissions(sshPrivateKeyDest, "0600");

  utils.logSuccess("Приватный SSH ключ сохранен");
}

async function setupSshPublicKey(): Promise<void> {
  if (await utils.fileExists(sshPublicKeyPath)) {
    utils.logWarning("SSH публичный ключ уже существует");
    return;
  }

  utils.logStep("Генерация публичного SSH ключа");

  const result = await $`ssh-keygen -y -f ${sshPrivateKeyDest}`;
  await Deno.writeTextFile(sshPublicKeyPath, result.stdout + "\n");
  await utils.setPermissions(sshPublicKeyPath, "0644");

  utils.logSuccess("Публичный SSH ключ создан");
}

async function main(): Promise<void> {
  $.verbose = false;
  console.log(chalk.bold("\n🔑 Настройка SSH ключей\n"));

  try {
    await setupSshPrivateKey();
    await setupSshPublicKey();
    console.log(chalk.bold.green("\n✓ Настройка SSH ключей завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при настройке SSH:\n", error);
    Deno.exit(1);
  }
}

main();
