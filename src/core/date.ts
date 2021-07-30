import { formatDistance, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { enNZ } from 'date-fns/locale'

export const formatDifference = (a: Date, b: Date): string => {
  return formatDistance(a, b, { addSuffix: true });
}

export { formatDuration } from 'date-fns';

export const toNewZealandTime = (date: Date) => utcToZonedTime(date, 'Pacific/Auckland');

export const formatNewZealandDate = (date: Date) => {
  if (!date)
    return '';
    
  try {
    return format(toNewZealandTime(date), 'PPPP', { locale: enNZ });
  }
  catch(e) {
    throw `Failed to format <${date}> to New Zealand date`;
  }
};

export const formatNewZealandTimeOfDay = (date: Date) => format(toNewZealandTime(date), 'p', { locale: enNZ });