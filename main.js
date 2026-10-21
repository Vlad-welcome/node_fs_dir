import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger.js";

const TYPES = {
  images: [".png", ".jpg", ".jpeg"],
  docs: [".txt", ".docx"],
};
const IGNORE = new Set(["node_modules", ".git", "copy"]);

async function main() {
  const files = await walk(import.meta.dirname);
  const stats = { total: 0, size: 0, byCategory: {} };
  const destDir = path.join(import.meta.dirname, "copy");
  await fs.mkdir(destDir, { recursive: true });

  for (const file of files) {
    const cat = checkType(file);
    const stat = await fs.stat(file);

    stats.total++;
    stats.size += stat.size;
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

    await copyFile(destDir, file);
  }

  logger.info(`Total: ${stats.total}`);
  logger.info(`Size: ${stats.size}`);
  logger.info(`Category:`);
  for (const [cat, count] of Object.entries(stats.byCategory)) {
    logger.info(`---${cat}: ${count}`);
  }
}

main().catch((err) => {
  logger.info(err);
  process.exit(1);
});

async function walk(dir) {
  const contents = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const item of contents) {
    if (IGNORE.has(item.name)) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      out.push(...(await walk(fullPath)));
    } else if (item.isFile) {
      out.push(fullPath);
    }
  }
  return out;
}

function checkType(file) {
  const { ext } = path.parse(file);
  const e = ext.toLowerCase();
  for (const [cat, exts] of Object.entries(TYPES)) {
    if (exts.includes(e)) return cat;
  }
  return "other";
}

async function copyFile(destDir, file) {
  const destFile = path.join(destDir, path.basename(file));
  await fs.copyFile(file, destFile);
  logger.info(`Copy ${file} -> ${destFile}`);
  return destFile;
}
