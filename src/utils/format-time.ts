import moment from 'moment';

console.log("Loading format-time utility");

// format time from seconds to HH:mm:ss or mm:ss
export const formatSeconds = (seconds: number): string => {
  console.log(`Formatting seconds: ${seconds}`);
  return moment
    .utc(seconds * 1000)
    .format(seconds > 3600 ? 'HH:mm:ss' : 'mm:ss');
};