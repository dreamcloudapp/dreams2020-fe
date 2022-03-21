const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = (webpackConfig, { env, paths }) => {
  // Don't split up the runtime or our chunks
  webpackConfig.optimization.runtimeChunk = false;
  webpackConfig.optimization.splitChunks = false;
  // Make sure main JS bundle is at same URL.
  webpackConfig.output.filename = "static/js/[name].js";
  // Main css bundle should be the same spot too
  const cssPlugin = webpackConfig.plugins.find(
    (plugin) => plugin instanceof MiniCssExtractPlugin
  );
  if (cssPlugin) {
    cssPlugin.options.filename = "static/css/[name].css";
  }
  return webpackConfig;
};
