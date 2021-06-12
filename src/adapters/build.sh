#!/bin/bash 
set -e 

function build {
  only=$ONLY
  name="$1"
  config="$2"

  if [ -n "$only" ]; then
    if [ "$name" != "$only" ]; then
      echo "Skipping <$name> because it is not <$only>"
      return
    fi
  fi
  
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
npx tsc -p src/adapters/tsconfig.json --listEmittedFiles
# Can't build rxjs with typescript@3.9.9
#
# node_modules/rxjs/dist/types/internal/operators/withLatestFrom.d.ts:3:79 - error TS1256: A rest element must be last in a tuple type.
#
#  export declare function withLatestFrom<T, O extends unknown[], R>(...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]): OperatorFunction<T, R>;
#
#npx tsc -p test/tsconfig.json --listEmittedFiles

echo ""

echo -e "Packing\n"

esbuild=./node_modules/.bin/esbuild

#buildMint

build 'core'        ./src/adapters/build/webpack.config.js
build 'mocks'       ./src/adapters/build/webpack.mocks.config.js

build 'adapters'    ./src/adapters/build/webpack.adapters.config.js
# [!fails to build] $esbuild src/adapters/application/real-application.js --bundle --outfile=./src/adapters/web/gui/assets/dist/real.bundle.js
$esbuild src/adapters/lobsters.js                     --bundle --outfile=./src/adapters/web/gui/assets/dist/lobsters.bundle.js

bash ./src/adapters/web/gui/flavours/ficus/src/build.sh

build 'svelte-smui' ./src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js
build 'svelte'      ./src/adapters/build/webpack.svelte.config.js
build 'vue'         ./src/adapters/build/webpack.vue.config.js
build 'react'       ./src/adapters/build/webpack.react.config.js

#build 'ficus'       ./src/adapters/web/gui/flavours/ficus/src/webpack.config.js

bash ./src/adapters/web/gui/flavours/ficus/src/build.sh

ls -lh ./src/adapters/web/gui/assets/dist