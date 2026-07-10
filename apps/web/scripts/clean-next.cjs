const fs = require("fs");
const path = require("path");

const nextDir = path.join(__dirname, "..", ".next");

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Cleaned apps/web/.next");
} catch (error) {
  console.warn("Could not clean apps/web/.next:", error.message);
}
