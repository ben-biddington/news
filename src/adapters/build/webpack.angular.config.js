const { distPath, entryPoint } = require('./webpack.settings');

module.exports = {
    mode: 'development',
    entry: {
      angular: entryPoint('/angular/main.ts'),
    },
    output: {
      path: distPath,
      filename: 'adapters.web.[name].bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: '[name]',
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
          {
              test: /\.ts$/,
              loaders: [
                  'awesome-typescript-loader'
              ]
          }
      ]
  },
    stats: 'errors-only'
  };
