export { WebDriver, By, WebElement, Key } from 'selenium-webdriver';
import { Builder } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/firefox';

export const wellington = (): Promise<number> => get('lyall-bay');
export const titahi     = (): Promise<number> => get('titahi-bay');

export const get = async (id: string): Promise<number> => {
  const driver = new Builder().
    forBrowser('firefox').
    setFirefoxOptions(new Options().headless()).
    build(); 

  try {
    await driver.get(`https://seatemperature.info/${id}-water-temperature.html`);
    
    return parseFloat(
      await driver.executeScript('return document.getElementsByClassName("a27 a32 a20")[0].childNodes[0].textContent'));
  } finally {
    driver.close();
  }
}