import { formatDistance, format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const formatDifference = (a: Date, b: Date): string => {
  return formatDistance(a, b, { addSuffix: true });
}

export { formatDuration } from 'date-fns';

export const toNewZealandTime = (date: Date) => utcToZonedTime(date, 'Pacific/Auckland');