#!/bin/bash 

echo "Building at <$PWD>"

webpack --config ./src/adapters/build/webpack.config.js
webpack --config ./src/adapters/build/webpack.mocks.config.js
webpack --config ./src/adapters/build/webpack.adapters.config.js

webpack --config ./src/adapters/build/webpack.svelte.config.js
webpack --config ./src/adapters/build/webpack.vue.config.js
webpack --config ./src/adapters/build/webpack.polymer.config.js
webpack --config ./src/adapters/build/webpack.react.config.js

if [[ "$@" =~ '--with-angular-js' ]]; then
    webpack --config ./src/adapters/build/webpack.angular.config.js
fi