#!/bin/bash

# Using this because we have named config file "package.react-native.json" so that it is skipped
# by the root `npm install`.

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

cd $SCRIPT_DIR

echo "Changed to <$PWD>"

ls

cp package.react-native.json package.json

echo "Copied <$SCRIPT_DIR/package.react-native.json> -> <$SCRIPT_DIR/package.json>"

npm i

rm package.json

cd - 

echo "Changed to <$PWD>"