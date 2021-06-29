const { distPath, entryPoint } = require('../../../../build/webpack.settings');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: {
    'solid' : './src/adapters/dist/adapters/web/gui/flavours/solid/index.jsx',
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
  },
  stats: 'errors-only'
};