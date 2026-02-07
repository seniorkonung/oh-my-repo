import { $, chalk } from "npm:zx@8.8.5";

export function getEnvVar(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    console.error(
      chalk.red(`Ошибка: переменная окружения ${name} не установлена`),
    );
    Deno.exit(1);
  }
  return value;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

export function logStep(message: string): void {
  console.log(chalk.blue(`→ ${message}`));
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow(message));
}

export function logError(message: string, error?: unknown): void {
  console.error(chalk.red(message), error);
}

export async function appendLineToFile(
  filePath: string,
  line: string,
  { mode = "0644", createDir = false, sudo = false }: { mode?: string; createDir?: boolean; sudo?: boolean } =
    {},
): Promise<boolean> {
  try {
    const content = await Deno.readTextFile(filePath);
    if (content.includes(line)) {
      return false;
    }
  } catch {
    // Файл не существует
  }

  if (createDir) {
    const dir = filePath.split("/").slice(0, -1).join("/");
    await createDirectory(dir, { sudo });
  }

  const echoCmd = sudo
    ? $`echo ${line} | sudo tee -a ${filePath} > /dev/null`
    : $`echo ${line} >> ${filePath}`;
  await echoCmd;
  const chmodCmd = sudo
    ? $`sudo chmod ${mode} ${filePath}`
    : $`chmod ${mode} ${filePath}`;
  await chmodCmd;
  return true;
}

export async function createSymlink(
  src: string,
  dest: string,
): Promise<boolean> {
  if (await fileExists(dest)) {
    return false;
  }

  await $`ln -s ${src} ${dest}`;
  return true;
}

/** Скачать файл по URL */
export async function downloadFile(
  url: string,
  dest: string,
  { mode = "0644" }: { mode?: string } = {},
): Promise<void> {
  await $`curl -fsSL ${url} -o ${dest}`;
  if (mode) {
    await $`chmod ${mode} ${dest}`;
  }
}

/** Распаковать tar.gz архив и найти распакованную директорию */
export async function extractTarGz(
  archive: string,
  { destDir = "/tmp", pattern }: { destDir?: string; pattern?: string } = {},
): Promise<string> {
  await $`tar -xzf ${archive} -C ${destDir}`;

  if (pattern) {
    const result =
      await $`find ${destDir} -maxdepth 1 -type d -name "${pattern}"`;
    return result.stdout.trim().split("\n")[0];
  }

  return destDir;
}

/** Распаковать zip архив и найти распакованную директорию */
export async function extractZip(
  archive: string,
  { destDir = "/tmp", pattern }: { destDir?: string; pattern?: string } = {},
): Promise<string> {
  await $`unzip -q -o ${archive} -d ${destDir}`;

  if (pattern) {
    const result =
      await $`find ${destDir} -maxdepth 1 -type d -name "${pattern}"`;
    return result.stdout.trim().split("\n")[0];
  }

  return destDir;
}

/** Создать директорию с указанными правами */
export async function createDirectory(
  path: string,
  { mode = "0755", sudo = false }: { mode?: string; sudo?: boolean } = {},
): Promise<void> {
  const cmd = sudo ? $`sudo mkdir -p ${path}` : $`mkdir -p ${path}`;
  await cmd;
  const chmodCmd = sudo
    ? $`sudo chmod ${mode} ${path}`
    : $`chmod ${mode} ${path}`;
  await chmodCmd;
}

/** Установить права на файл или директорию */
export async function setPermissions(
  path: string,
  mode: string,
  { sudo = false }: { sudo?: boolean } = {},
): Promise<void> {
  const cmd = sudo ? $`sudo chmod ${mode} ${path}` : $`chmod ${mode} ${path}`;
  await cmd;
}

/** Склонировать git репозиторий */
export async function gitClone(
  repo: string,
  dest: string,
): Promise<void> {
  await $`git clone ${repo} ${dest}`;
}

/** Скопировать файл с указанием прав */
export async function copyFile(
  src: string,
  dest: string,
  { mode = "0644", createDir = false }: { mode?: string; createDir?: boolean } =
    {},
): Promise<void> {
  if (createDir) {
    const dir = dest.split("/").slice(0, -1).join("/");
    await $`mkdir -p ${dir}`;
  }

  await $`cp ${src} ${dest}`;
  await $`chmod ${mode} ${dest}`;
}

/** Создать символическую ссылку с принудительной заменой */
export async function createSymlinkForce(
  src: string,
  dest: string,
  { sudo = false }: { sudo?: boolean } = {},
): Promise<void> {
  const cmd = sudo ? $`sudo ln -sf ${src} ${dest}` : $`ln -sf ${src} ${dest}`;
  await cmd;
}
