#!/bin/bash

echo "Copying assets"

cp "../../../adapters/web/gui/assets/dist/real.bundle.js" ./build/assets

#echo "Compiling"

#npx tsc -p ./tsconfig.json --listEmittedFiles

#echo "Webpack"

#npx webpack --config webpack.config

#cp ./dist/core.bundle.js ./assets

echo "Packing"

cd build

npx androidjs b

cd - 