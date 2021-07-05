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
npx tsc -p src/adapters/web-worker/tsconfig.json --listEmittedFiles
npx tsc -p test/tsconfig.json --listEmittedFiles

cp ./src/adapters/web-worker/dist/network-probe.js ./src/adapters/web/gui/

# Can't build rxjs with typescript@3.9.9
#
# node_modules/rxjs/dist/types/internal/operators/withLatestFrom.d.ts:3:79 - error TS1256: A rest element must be last in a tuple type.
#
#  export declare function withLatestFrom<T, O extends unknown[], R>(...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]): OperatorFunction<T, R>;
#
#npx tsc -p test/tsconfig.json --listEmittedFiles

echo ""

echo -e "Packing\n"

#buildMint

build 'core'        ./src/adapters/build/webpack.config.js
build 'mocks'       ./src/adapters/build/webpack.mocks.config.js
build 'adapters'    ./src/adapters/build/webpack.adapters.config.js

esbuild=./node_modules/.bin/esbuild

#
# [ESBUILD] The following works but fails in browser with 'Dynamic require of "http" is not supported'
#
# Without `--external:http --external:https --external:timers` you get these errors:
#
#  > node_modules/rss-parser/lib/parser.js:2:21: error: Could not resolve "http" (use "--platform=node" when building for node)
#    2 │ const http = require('http');
#      ╵                      ~~~~~~
#
#  > node_modules/rss-parser/lib/parser.js:3:22: error: Could not resolve "https" (use "--platform=node" when building for node)
#    3 │ const https = require('https');
#      ╵                       ~~~~~~~
#
#  > node_modules/xml2js/lib/parser.js:17:25: error: Could not resolve "timers" (use "--platform=node" when building for node)
#    17 │   setImmediate = require('timers').setImmediate;
#       ╵                          ~~~~~~~~
#
# ./node_modules/.bin/esbuild ./src/adapters/application/real-application.js --external:http --external:https --external:timers --bundle --global-name=real --outfile=./src/adapters/web/gui/assets/dist/real.bundle.js 
#
# $esbuild ./src/adapters/application/real-application.js --external:http --external:https --external:timers --bundle --global-name=real --outfile=./src/adapters/web/gui/assets/dist/real.bundle.js
#
#
# `--global-name=real` is the equivalent of webpack 'library' field, see https://esbuild.github.io/api/#global-name
#
#
# I think we have an issue in general with dynamic requires. Browsers do not support them (?) and so this advice does not help:
# 
#   https://esbuild.github.io/getting-started/#bundling-for-the-browser
#
# It may be easier to find different rss parser.
#
#$esbuild src/adapters/lobsters.js                     --bundle --outfile=./src/adapters/web/gui/assets/dist/lobsters.bundle.js

build 'svelte-smui' ./src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js
build 'svelte'      ./src/adapters/build/webpack.svelte.config.js
build 'vue'         ./src/adapters/build/webpack.vue.config.js
build 'react'       ./src/adapters/build/webpack.react.config.js
build 'solid'       ./src/adapters/web/gui/flavours/solid/webpack.config.js

#build 'ficus'       ./src/adapters/web/gui/flavours/ficus/src/webpack.config.js

bash ./src/adapters/web/gui/flavours/ficus/src/build.sh

ls -lh ./src/adapters/web/gui/assets/dist