import { WeatherForecast, WeatherQuery} from '../core/weather';

export class MetserviceWeatherQuery implements WeatherQuery {
  get: any;

  constructor(ports: any = {}){
    this.get = ports.get;
  }

  sevenDays(): Promise<WeatherForecast[]> {
    return this.get('/wellington-weather/week').then(reply => JSON.parse(reply.body));
  }
}