export { WebDriver, By, WebElement, Key } from 'selenium-webdriver';
import { Builder, By } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';
import { DevNullLog, Log } from '../../core/logging/log';
require('geckodriver');

export const wellington = (): Promise<number> => get({ log: new DevNullLog() }, 'lyall-bay');
export const titahi     = (): Promise<number> => get({ log: new DevNullLog() }, 'titahi-bay');

export type Ports = {
  log: Log;
}

export type Opts = {
  headless: boolean;
}

export const get = async (
  ports: Ports = { log: new DevNullLog() }, 
  id: string, 
  opts: Opts = { headless: true }): Promise<number> => {
  
  const firefoxOptions = opts.headless ? new Options().headless() : new Options();

  const driver = new Builder().
    forBrowser('firefox').
    setFirefoxOptions(firefoxOptions).
    build();

  const timeouts = { implicit: 10000, pageLoad: 60000 }

  await driver.manage().setTimeouts(timeouts);

  ports.log.info(`[seatemperature.info] timeouts: ${JSON.stringify(timeouts, null, 2)}`);

  const url = `https://seatemperature.info/${id}-water-temperature.html`;

  const readerUrl = `about:reader?url=${url}`;

  ports.log.info(`[seatemperature.info] url: ${url}`);
  ports.log.info(`[seatemperature.info] reader url: ${readerUrl}`);
 
  try {
    await driver.get(readerUrl);
    
    ports.log.info(`[seatemperature.info] finding element`);

    // [i] They changed the page to load really slowly, adds etc. Using reader view is very fast.
    await driver.findElement(By.css("#readability-page-1"));

    ports.log.info(await driver.executeScript(`return document.querySelectorAll('div#readability-page-1 p')[8].innerText`));

    const textValue: string = await driver.executeScript(`return document.querySelectorAll('div#readability-page-1 p')[8].innerText`); 

    const pattern = /(.+)°C/; // 14.4°C

    return parseFloat(textValue.match(pattern)[0]);

  } finally {
    driver.close();
  }
}