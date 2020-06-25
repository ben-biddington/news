var path = require('path');

module.exports = {
    distPath: path.resolve(__dirname, '../web/gui/assets/dist'),
    entryPoint: relativePath => path.join(path.resolve(__dirname, '../web/gui/flavours'), relativePath), 
}