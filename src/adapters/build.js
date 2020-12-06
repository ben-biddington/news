const { exec } = require('child_process');

const webpack = async (name, path) => {
    let messages = `[webpack] Building ${name} \t\t<${path}>`;

    messages += await build(`webpack --config ${path}`);

    return messages;
}

const build = (command) => {
    return new Promise((accept, _) => {
        exec(command, (error, stdout, stderr) => accept(stdout || error || stderr));
    });
}

return build('npx tsc -p src/core/tsconfig.json --listEmittedFiles'   ).then(console.log).then(() => Promise.all([
    webpack('[core]'        , './src/adapters/build/webpack.config.js').then(console.log),
    webpack('[mocks]'       , './src/adapters/build/webpack.mocks.config.js').then(console.log),
    webpack('[adapters]'    , './src/adapters/build/webpack.adapters.config.js').then(console.log),
    webpack('[svelte-smui]' , './src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js').then(console.log),
    webpack('[svelte]'      , './src/adapters/web/gui/flavours/svelte-smui/src/webpack.config.js').then(console.log),
    webpack('[vue]'         , './src/adapters/build/webpack.vue.config.js').then(console.log),
    /*webpack('[react]'       , './src/adapters/build/webpack.react.config.js').then(console.log),*/
]));
