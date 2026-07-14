const path = require("path");

module.exports = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  webpack(config, { defaultLoaders }) {
    config.resolve.alias["@domain"] = path.resolve(__dirname, "../../packages/domain/src");
    config.module.rules.push({
      test: /\.ts$/,
      include: [path.resolve(__dirname, "../../packages/domain/src")],
      use: defaultLoaders.babel
    });
    return config;
  }
};
