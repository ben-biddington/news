export const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const settings = {
  noaaToken: process.env.NOAA_API_TOKEN,
  cockroachDbConnectionString: process.env.COCKROACH_CONNECTION_STRING,
}