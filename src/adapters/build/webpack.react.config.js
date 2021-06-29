const { distPath, entryPoint } = require('./webpack.settings');

module.exports = {
  mode: 'development',
  entry: {
    react: entryPoint('/react/main.js'),
  },
  output: {
    path: distPath,
    filename: 'adapters.web.[name].bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: '[name]',
  },
  module: {
    rules: [{
      use: {
        loader: 'babel-loader',
        options: {
          "presets": ["@babel/env", "@babel/react"]
        }
      },
      test: /\.js$/,
      exclude: /node_modules/,
    }]
  },
  stats: 'errors-only'
};
