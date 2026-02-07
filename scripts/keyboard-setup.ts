#!/usr/bin/env -S deno run --allow-read --allow-sys --allow-env --allow-run
import { $, chalk } from "npm:zx@8.8.5";
import * as utils from "./utils.ts";

async function setupKeyboardLayoutSwitch(): Promise<void> {
  utils.logStep("Установка переключения раскладки по Caps Lock");

  try {
    await $`gsettings set org.gnome.desktop.input-sources xkb-options "['grp:caps_toggle']"`;
    utils.logSuccess("Переключение раскладки настроено");
  } catch (error) {
    utils.logWarning("Не удалось установить настройку клавиатуры (возможно не работает в GNOME)");
  }
}

async function main(): Promise<void> {
  $.verbose = false;
  console.log(chalk.bold("\n⌨️  Настройка клавиатуры\n"));

  try {
    await setupKeyboardLayoutSwitch();
    console.log(chalk.bold.green("\n✓ Настройка клавиатуры завершена!\n"));
  } catch (error) {
    utils.logError("\n✗ Ошибка при настройке клавиатуры:\n", error);
    Deno.exit(1);
  }
}

main();
