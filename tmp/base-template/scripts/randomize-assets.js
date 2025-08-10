const fs = require("fs");
const path = require("path");
const glob = require("glob");

function generateHash() {
  return Math.random().toString(36).substring(2, 10);
}

const outDir = path.join(__dirname, "..", "out");

function randomizeAssets() {
  const assetFiles = glob.sync("**/*.{js,css}", {
    cwd: outDir,
    absolute: true,
  });

  const renameMap = {};

  assetFiles.forEach((filePath) => {
    const parsed = path.parse(filePath);

    if (!parsed.name.match(/.+\-.{8,}/)) return;

    const newName = `${parsed.name.split("-")[0]}-${generateHash()}${
      parsed.ext
    }`;
    const newPath = path.join(parsed.dir, newName);

    fs.renameSync(filePath, newPath);

    const relOld = path.relative(outDir, filePath).replace(/\\/g, "/");
    const relNew = path.relative(outDir, newPath).replace(/\\/g, "/");

    renameMap[relOld] = relNew;
  });

  return renameMap;
}

function replaceInFiles(renameMap) {
  const htmlAndJsFiles = glob.sync("**/*.{html,js,json}", {
    cwd: outDir,
    absolute: true,
  });

  htmlAndJsFiles.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");

    Object.entries(renameMap).forEach(([oldName, newName]) => {
      const escapedOld = oldName.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      const regex = new RegExp(escapedOld, "g");
      content = content.replace(regex, newName);
    });

    fs.writeFileSync(file, content, "utf8");
  });
}

const renameMap = randomizeAssets();
replaceInFiles(renameMap);

console.log("✅ Assets randomized.");
