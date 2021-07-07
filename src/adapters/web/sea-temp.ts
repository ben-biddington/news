export { WebDriver, By, WebElement, Key } from 'selenium-webdriver';
import { Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';

export const wellington = async (): Promise<number> => {
  const driver = new Builder().
    forBrowser('firefox').
    setFirefoxOptions(new Options().headless()).
    build(); 

  try {
    await driver.get('https://seatemperature.info/wellington-water-temperature.html');
    
    return parseFloat(
      await driver.executeScript('return document.getElementsByClassName("a27 a32 a20")[0].childNodes[0].textContent'));
  } finally {
    driver.close();
  }
}