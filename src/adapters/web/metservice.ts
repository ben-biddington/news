import { WeatherForecast } from '../../core/weather';

// https://www.metservice.com/publicData/webdata/weather-station-location/93437/wellington-central
export const sevenDays = async (ports) : Promise<Array<WeatherForecast>> => {
  const { get, log = () => {} } = ports;
  
  const reply = await get('https://www.metservice.com/publicData/webdata/towns-cities/locations/wellington/7-days').
    then(reply => JSON.parse(reply.body));

  const days = reply.layout.primary.slots.main.modules[0].days

  return days.map(day => ({
    date: new Date(day.date),
    condition: day.condition, 
    text: day.forecasts[0].statement,
    sunrise: day.forecasts[0].sunrise,
    sunset: day.forecasts[0].sunset,
    temperature: {
      high: parseInt(day.forecasts[0].highTemp),
      low: parseInt(day.forecasts[0].lowTemp)
    }
  }));
}