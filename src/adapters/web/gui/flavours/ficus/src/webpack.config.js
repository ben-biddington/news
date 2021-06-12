// [13-Jun-2021] Trying esbuild] See ./build.sh
const { distPath, entryPoint } = require('../../../../../build/webpack.settings');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
    entry: {
      'ficus' : entryPoint('ficus/src/main.js'),
    },
    output: {
      path: distPath,
      filename: 'adapters.web.[name].bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: '[name]',
    },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'adapters.web.[name].css',
      chunkFilename: '[name].[id].css'
    })
  ],
  module: {
    rules: [ ]
  },
  stats: 'errors-only'
};