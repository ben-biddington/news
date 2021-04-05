// https://www.metservice.com/publicData/webdata/weather-station-location/93437/wellington-central
export const sevenDays = async (get: any) : Promise<Array<WeatherForecast>> => {
  const reply = await get('http:///wrong-on-purpose').then(reply => JSON.parse(reply.body));
  
  const days = reply.layout.primary.slots.main.modules[0].days

  return days.map(it => ({
    condition: it.condition, 
    text: it.forecasts[0].statement,
    sunrise: it.forecasts[0].sunrise,
    sunset: it.forecasts[0].sunset,
    temperature: {
      high: parseInt(it.forecasts[0].highTemp),
      low: parseInt(it.forecasts[0].lowTemp)
    }
  }));
}

export interface WeatherForecast {
  condition: string;
  text: string;
  sunrise: Date;
  sunset: Date;
  temperature: TemperatureRange
}

export interface TemperatureRange {
  low: number;
  high: number;
}