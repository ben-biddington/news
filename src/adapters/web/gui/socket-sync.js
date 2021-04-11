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
        //@todo: bit heavy handed? Yes.
        console.log(`[socket] message is a delete, reloading`);

        await application.lobsters.list();
        await application.hackerNews.list();
      }

    });
  }
}

module.exports = { SocketSync }