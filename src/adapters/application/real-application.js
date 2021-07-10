const { Application }                   = require('../../core/dist/application');
const { Ports }                         = require('../../core/dist/ports');
const { ConcreteNewsApplication }       = require('../../core/dist/app');
const { NewsItem }                      = require('../../core/dist/news-item');

const { FetchBasedInternet }            = require('../dist/adapters/web/fetch-based-internet');

const { createPorts } = require('../dist/adapters/application/createPorts');
const { create: createDiaryApplication } = require('../dist/adapters/application/real-diary-application');

//
// [i] This is where the real application is bootstrapped from
//
const application = (toggles, settings) => {
  const internet = new FetchBasedInternet();
  
  const ports = createPorts({ toggles, window, internet, baseUrl: settings.get('baseUrl') || '' });
  
  return new Application(ports, settings, { allowStats: true });
}

const { QueryStringToggles } = require('../web/toggling/query-string-toggles');
const { QueryStringSettings } = require('../dist/adapters/web/query-string-settings');
const { SocketSync } = require('../web/gui/socket-sync');
const { UIEvents } = require('../web/gui/ui-events');
const { Title } = require('../web/gui/title');

const diaryApplication = () => createDiaryApplication(new FetchBasedInternet());

module.exports = { application, diaryApplication, Ports, QueryStringToggles, QueryStringSettings, NewsItem, SocketSync, UIEvents, Title, ConcreteNewsApplication }