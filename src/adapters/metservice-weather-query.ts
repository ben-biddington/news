import { template } from 'solid-js/web';
import { WaterTemperature, WeatherForecast, WeatherQuery} from '../core/weather';

export class MetserviceWeatherQuery implements WeatherQuery {
  get: any;

  constructor(ports: any = {}){
    this.get = ports.get;
  }

  sevenDays(): Promise<WeatherForecast[]> {
    return this.get('/wellington-weather/week').
      then(reply => JSON.parse(reply.body)).
      then(forecasts => forecasts.map(forecast => ({ ...forecast, date: new Date(forecast.date) })));
  }
  
  async seaTemperature(): Promise<WaterTemperature[]> {
    return await Promise.all([
      this.get('/sea-temp/titahi-bay' ).then(reply => ({ name: 'Tītahi Bay', temperature: JSON.parse(reply.body)})),
      this.get('/sea-temp/lyall-bay'  ).then(reply => ({ name: 'Lyall Bay', temperature: JSON.parse(reply.body)}))
    ]);
  }
}