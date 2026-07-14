const fs = require("fs");
const path = require("path");

const nextDirs = [".next", ".next-dev", ".next-build"].map((dir) => path.join(__dirname, "..", dir));

for (const nextDir of nextDirs) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log(`Cleaned apps/web/${path.basename(nextDir)}`);
  } catch (error) {
    console.warn(`Could not clean apps/web/${path.basename(nextDir)}:`, error.message);
  }
}
