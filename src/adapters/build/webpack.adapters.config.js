var path = require('path');

const { distPath } = require('./webpack.settings');

module.exports = {
  mode: 'development',
  entry: {
    real:        path.resolve(__dirname, '../application/real-application.js'),
    lobsters:    path.resolve(__dirname, '../lobsters.js')
  },
  output: {
    path: distPath,
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: '[name]',
  },
  stats: 'errors-only'
};