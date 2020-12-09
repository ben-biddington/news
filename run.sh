#!/bin/bash

set -e

if  [[ "$@" =~ "--build" ]]; then
    bash ./src/adapters/build.sh "$@"
fi

npm run server