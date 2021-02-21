#!/bin/bash 
set -e 

function build {
    name="$1"
    config="$2"
    echo -e "[webpack] Building $1 \t\t<$2>"
    webpack --config $config
}

function buildMint {
    cd src/adapters/web/gui/flavours/mint

    mint build --skip-service-worker --skip-icons

    cp ./dist/index.js ../../assets/dist/adapters.web.mint.bundle.js

    cd - 
}

if [ ! -d 'node_modules' ]; then
    npm install    
fi

echo -e "Building at <$PWD>\n"

echo -e "Compiling typescript\n"

npx tsc -p src/core/tsconfig.json --listEmittedFiles

echo ""

echo -e "Packing\n"

buildMint

build 'core'        ./src/adapters/build/webpack.config.js
build 'mocks'       ./src/adapters/build/webpack.mocks.config.js
build 'adapters'    ./src/adapters/build/webpack.adapters.config.js

build 'svelte-smui' ./src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js
build 'svelte'      ./src/adapters/build/webpack.svelte.config.js
build 'vue'         ./src/adapters/build/webpack.vue.config.js
build 'react'       ./src/adapters/build/webpack.react.config.js