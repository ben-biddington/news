const { distPath, entryPoint } = require('./webpack.settings');

module.exports = {
  mode: 'development',
  entry: {
    "vanilla": entryPoint('/vanilla/vanilla.js')
  },
  output: {
    path: distPath,
    filename: 'adapters.web.[name].bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'vanilla',
  },
  stats: 'errors-only'
};