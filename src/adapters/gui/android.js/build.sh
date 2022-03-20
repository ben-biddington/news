#!/bin/bash
set -eou pipefail

npx tsc

echo "Copying assets"

cp "../../../adapters/web/gui/assets/dist/real.bundle.js" ./build/assets

echo "Compiling"

npx webpack --config webpack.config

cp "./dist/adapters.web.solid.bundle.js" ./build/assets

echo "Packing"

cd build

npx androidjs b --release

cd - 