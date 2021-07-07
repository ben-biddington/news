
import { EventEmitter } from 'events';
import { WeatherQuery, WeatherForecast, WaterTemperature } from '../../weather';

export class WeatherUseCases {
  private weatherQuery: WeatherQuery;
  private events: EventEmitter;

  constructor(weatherQuery: WeatherQuery, events: EventEmitter) {
    this.weatherQuery = weatherQuery;
    this.events = events;
  }

  public sevenDays = async (): Promise<Array<WeatherForecast>> => {
    const weather = await this.weatherQuery.sevenDays();

    this.events.emit('weather-loaded', { weather });

    return weather;
  }

  public seaTemperature = async (): Promise<WaterTemperature[]> => {
    const temp = await this.weatherQuery.seaTemperature();

    this.events.emit('sea-temp-loaded', temp);

    return temp;
  }
}