export interface WeatherQuery {
  sevenDays: () => Promise<Array<WeatherForecast>>;
}

export interface WeatherForecast {
  date: Date;
  condition: string;
  text: string;
  sunrise: Date;
  sunset: Date;
  temperature: TemperatureRange;
}

export interface TemperatureRange {
  low: number;
  high: number;
}