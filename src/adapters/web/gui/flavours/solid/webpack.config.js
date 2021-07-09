const { distPath } = require('../../../../build/webpack.settings');

module.exports = {
  mode: 'development',
  entry: {
    'solid' : './src/adapters/dist/adapters/web/gui/flavours/solid/index.jsx',
    'diary' : './src/adapters/dist/adapters/web/gui/flavours/solid/diary.jsx',
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