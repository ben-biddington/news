const { SocketListener } = require('./socket-listener');

class SocketSync {
  constructor(url = 'ws://localhost:8080', log) {
      this._url = url;
      this._log = log;
      this._listener = new SocketListener(
        url, 
        { info: log, trace: log });

      log(`[socket] Starting to listen on url <${url}>`);
          
      this._listener.onOpen(m => console.log(`[socket] ${JSON.stringify(m)}`));
  }

  connect(application) {
    this._listener.onMessage(async m => {
        
      const message = JSON.parse(m.data);

      console.log(`[socket] data:${m.data}`);

      if (message.verb === 'delete') {
        console.log(`[socket] message is a delete, removing item <${message.id}>`);

        // @todo: this causes infinite loop. We just want to remove it from local memory, not delete again.
        await application.lobsters.remove(message.id);
        await application.hackerNews.remove(message.id);
      }
    });
  }
}

module.exports = { SocketSync }