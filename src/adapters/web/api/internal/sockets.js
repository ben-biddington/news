const WebSocket = require('ws');

class SocketNotifier {
    constructor(port) {
        
        this._wss = new WebSocket.Server({ port });

        this._wss.on('connection', ws => {
            console.log(`[ws] connected ${ws.readyState}`);
        });
    }

    // https://github.com/websockets/ws
    notify(message = {}) {
        const text = JSON.stringify(message);

        this._wss.clients.forEach(client => {
            console.log(`[ws] Notifying clients with: ${text}`);

            if (client.readyState === WebSocket.OPEN) {
                client.send(text);
                console.log(`[ws] Sent: ${text}`);
            } else {
                console.log(`[ws] Invalid ready state <${client.readyState}>`);   
            }
        });
    }
}

module.exports = { SocketNotifier }