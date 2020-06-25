#!/bin/bash

set -e

bash ./src/adapters/build.sh "$@"

npm run server