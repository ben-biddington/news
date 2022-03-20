const path = require('path');

// console.log(path.resolve(__dirname, 'dist'));

const distPath = path.resolve(__dirname, 'dist'); 

module.exports = {
  mode: 'development',
  entry: {
    'solid' : './dist/adapters/gui/android.js/src/ui/index.jsx',
    'init' : './dist/adapters/gui/android.js/src/adapters.js',
  },
  output: {
    path: distPath,
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