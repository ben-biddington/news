// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/open_event

class SocketListener {
  constructor(url = 'ws://localhost:8080', log) {
    this._url = url;
    this._log = log;
    this._log.trace(`Connecting to <${this._url}>`);
    this._socket = new WebSocket(this._url, 'json');
  }

  onOpen(handler) {
    this._socket.addEventListener('open', handler);
  }

  onMessage(handler) {
    this._socket.addEventListener('message', handler);
  }

  onClose(handler) {
    this._socket.addEventListener('close', handler);
  }
}

module.exports = { SocketListener }