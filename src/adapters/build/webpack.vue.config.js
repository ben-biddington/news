const { distPath, entryPoint } = require('./webpack.settings');

// https://vue-loader.vuejs.org/guide/#vue-cli

const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    mode: 'production',
    entry: {
      vue: entryPoint('/vue/main.js'),
    },
    output: {
      path: distPath,
      filename: 'adapters.web.[name].bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: '[name]',
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: ["vue-style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin()
    ],
    stats: 'errors-only'
  };
