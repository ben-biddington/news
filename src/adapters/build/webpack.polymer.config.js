const { distPath, entryPoint } = require('./webpack.settings');

module.exports = {
    mode: 'production',
    entry: {
      polymer: entryPoint('/polymer/main.js'),
    },
    output: {
      path: distPath,
      filename: 'adapters.web.[name].bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: '[name]',
    },
    module: {
      rules: [ ]
    },
    plugins: [ ],
    stats: 'errors-only'
  };
