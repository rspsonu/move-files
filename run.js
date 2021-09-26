const fs = require("fs");
const path = require("path");

const readFiles = (filePath, matchingString = [], filesFound = []) => {
  try {
    if (filePath.length) {
      const currentPath = path.resolve(filePath.shift());
      const fileStats = fs.statSync(currentPath);

      if (fileStats.isDirectory()) {
        process.chdir(currentPath);
        readFiles(fs.readdirSync(currentPath), matchingString, filesFound);
      } else if (fileStats.isFile() && currentPath.match(matchingString)) {
        filesFound.push(currentPath);
      }

      return readFiles(filePath, matchingString, filesFound);
    } else {
      process.chdir(path.dirname(process.cwd()));
      return filesFound;
    }
  } catch (e) {
    console.error(e);
  }
};

const createFoldersAndFile = (
  source,
  destination,
  folderPaths,
  move = false
) => {
  if (folderPaths.length) {
    const newPath = folderPaths.shift();
    const filePath = path.relative(destination, newPath).split(source)[1];
    const pathToCreate = path.dirname(filePath);
    fs.mkdirSync(path.join(destination, pathToCreate), {
      recursive: true,
    });
    fs.copyFileSync(newPath, path.join(destination, filePath));
    if (move) {
      fs.rmSync(newPath);
    }
    console.log(
      "%s \x1b[42m\x1b[30m%s\x1b[0m",
      `${move ? "Moved" : "Copied"}`,
      `${newPath}`
    );
    console.log(
      "%s \x1b[44m\x1b[30m%s\x1b[0m",
      "to",
      `${path.join(destination, filePath)}\n`
    );
    createFoldersAndFile(source, destination, folderPaths, move);
  }
};

const copyFiles = (source, partsToMatch, destination, move) => {
  const filesFound = readFiles(
    [source],
    partsToMatch
      .split(",")
      .map((part) => `(${part})`)
      .join("|")
  );
  createFoldersAndFile(
    source,
    path.resolve(__dirname, destination),
    filesFound,
    move === "move"
  );
};

copyFiles(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
