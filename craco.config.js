const webpackEmbed = require("./src/modules/webpack-embed");
module.exports = function ({ env }) {
  return {
    webpack: {
      configure: webpackEmbed,
    },
  };
};
