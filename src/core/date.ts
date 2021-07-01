import { formatDistance, format } from 'date-fns';

export const formatDifference = (a: Date, b: Date): string => {
  return formatDistance(a, b, { addSuffix: true });
}

export { formatDuration } from 'date-fns';