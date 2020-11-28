const { distPath, entryPoint } = require('../../../../../build/webpack.settings');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'development',
    entry: {
      'svelte-smui' : entryPoint('svelte-smui/src/main.js'),
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
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }]
      },
      canPrint: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.(html|svelte)$/,
        use: 'svelte-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          /*MiniCssExtractPlugin.loader,*/
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  './src/adapters/web/gui/flavours/svelte-smui/src/theme',
                  './node_modules'
                ]
              }
            }
          }
        ]
      }
    ]
  },
  stats: 'errors-only'
};