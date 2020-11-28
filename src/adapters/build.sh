#!/bin/bash 
set -e 

echo "Building at <$PWD>"

echo "Compiling typescript"

npx tsc -p src/core/tsconfig.json --listEmittedFiles

echo "Packing"

webpack --config ./src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js

webpack --config ./src/adapters/build/webpack.config.js
webpack --config ./src/adapters/build/webpack.mocks.config.js
webpack --config ./src/adapters/build/webpack.adapters.config.js

webpack --config ./src/adapters/build/webpack.svelte.config.js
webpack --config ./src/adapters/build/webpack.vue.config.js
webpack --config ./src/adapters/build/webpack.react.config.js