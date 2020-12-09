#!/bin/bash

set -e

# formatters: https://github.com/mochajs/mocha/tree/master/lib/reporters
# example:
#
#   $ ./test.sh -- --reporter=progress
#

args="-- --reporter=nyan"

echo "$@"

if [[ "$@" -ne "" ]]; then
    args="$@"
fi

npm run test.unit $args
npm run test.system
npm run test.integration $args