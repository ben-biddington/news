var path            = require('path');
const { distPath }  = require('./webpack.settings');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../application/mock-application.js'),
  output: {
    path: distPath,
    filename: 'mock.application.bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'mock',
  },
  stats: 'errors-only'
}