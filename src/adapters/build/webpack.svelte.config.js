const { distPath, entryPoint } = require('./webpack.settings');

module.exports = {
    mode: 'development',
    entry: {
      svelte: entryPoint('svelte/src/main.js'),
    },
    output: {
      path: distPath,
      filename: '[name].bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: '[name]',
    },
    module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: false,
						hotReload: false
					}
				}
			},
		]
	},
    stats: 'errors-only'
  };
