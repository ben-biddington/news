const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    'solid' : './dist/ui/index.jsx',
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'adapters.web.[name].bundle.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: '[name]',
  },
  plugins: [],
  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
          options: {
            "sourceType": 'unambiguous',
            "presets": ["solid"]
          }
        },
        test: /\.jsx$/,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
    }
  },
  stats: 'errors-only'
};