import { expect }           from '@test/integration/integration-test';
import { fakeGet, get }     from '@test/integration/support/net';
import { settings }         from '@test/integration/support/support';

const describeIf = (condition: { when: boolean, skipMessage: string }, name, fn) => {
  if (condition.when) {
    describe(name, fn);
  } else {
    describe.skip(`[${condition.skipMessage}] ${name}`, fn);
  }
}

const tokenIsPresent = { 
  when: settings.noaaToken?.length > 0, 
  skipMessage: `Skipped because no token is available`
}

// -24.926,-176.786,-51.014,162.999 
// Use the map here: https://gis.ncdc.noaa.gov/maps/ncei/marine
// [i] https://grantwinney.com/what-is-noaa-api/#authorization
describeIf(tokenIsPresent, 'Noaa -- the basics', () => {
  it('parses reply as expected', async () => {
    const token = settings.noaaToken;

    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/locations', { token });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    expect(result.statusCode).to.eql(200);
  });

  // [i] https://www.ncdc.noaa.gov/cdo-web/webservices/v2#stations
  it('can find stations by coords (south-west -> north-east)', async () => {
    let result = await get(
      'https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?extent=-41.9649112711425,172.76740003531154,-36.48900236187031,179.71075935981042', { token: settings.noaaToken });
    
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  });

  it('stations extent 47.5204,-122.2047,47.6139,-122.1065 stations', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/locations?datasetid=NORMAL_DLY', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  });

  it('can return location categories', async () => {
    const result = await get('  https://www.ncdc.noaa.gov/cdo-web/api/v2/locationcategories', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

    {
      "name": "City",
      "id": "CITY"
    },
    {
      "name": "Climate Division",
      "id": "CLIM_DIV"
    },
    {
      "name": "Climate Region",
      "id": "CLIM_REG"
    },
    {
      "name": "Country",
      "id": "CNTRY"
    },
    {
      "name": "County",
      "id": "CNTY"
    },
    {
      "name": "Hydrologic Accounting Unit",
      "id": "HYD_ACC"
    },
    {
      "name": "Hydrologic Cataloging Unit",
      "id": "HYD_CAT"
    },
    {
      "name": "Hydrologic Region",
      "id": "HYD_REG"
    },
    {
      "name": "Hydrologic Subregion",
      "id": "HYD_SUB"
    },
    {
      "name": "State",
      "id": "ST"
    },
    {
      "name": "US Territory",
      "id": "US_TERR"
    },
    {
      "name": "Zip Code",
      "id": "ZIP"
    }

     */
  });

  it('can return data types', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

     */
  });
  
  it('can return data categories', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/datacategories?limit=50', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

    {
      "name": "Annual Agricultural",
      "id": "ANNAGR"
    },
    {
      "name": "Annual Degree Days",
      "id": "ANNDD"
    },
    {
      "name": "Annual Precipitation",
      "id": "ANNPRCP"
    },
    {
      "name": "Annual Temperature",
      "id": "ANNTEMP"
    },
    {
      "name": "Autumn Agricultural",
      "id": "AUAGR"
    },
    {
      "name": "Autumn Degree Days",
      "id": "AUDD"
    },
    {
      "name": "Autumn Precipitation",
      "id": "AUPRCP"
    },
    {
      "name": "Autumn Temperature",
      "id": "AUTEMP"
    },
    {
      "name": "Computed",
      "id": "COMP"
    },
    {
      "name": "Computed Agricultural",
      "id": "COMPAGR"
    },
    {
      "name": "Degree Days",
      "id": "DD"
    },
    {
      "name": "Dual-Pol Moments",
      "id": "DUALPOLMOMENT"
    },
    {
      "name": "Echo Tops",
      "id": "ECHOTOP"
    },
    {
      "name": "Evaporation",
      "id": "EVAP"
    },
    {
      "name": "Hydrometeor Type",
      "id": "HYDROMETEOR"
    },
    {
      "name": "Land",
      "id": "LAND"
    },
    {
      "name": "Miscellany",
      "id": "MISC"
    },
    {
      "name": "Other",
      "id": "OTHER"
    },
    {
      "name": "Overlay",
      "id": "OVERLAY"
    },
    {
      "name": "Precipitation",
      "id": "PRCP"
    },
    {
      "name": "Pressure",
      "id": "PRES"
    },
    {
      "name": "Reflectivity",
      "id": "REFLECTIVITY"
    },
    {
      "name": "Sky cover & clouds",
      "id": "SKY"
    },
    {
      "name": "Spring Agricultural",
      "id": "SPAGR"
    },
    {
      "name": "Spring Degree Days",
      "id": "SPDD"
    },
    {
      "name": "Spring Precipitation",
      "id": "SPPRCP"
    },
    {
      "name": "Spring Temperature",
      "id": "SPTEMP"
    },
    {
      "name": "Summer Agricultural",
      "id": "SUAGR"
    },
    {
      "name": "Summer Degree Days",
      "id": "SUDD"
    },
    {
      "name": "Sunshine",
      "id": "SUN"
    },
    {
      "name": "Summer Precipitation",
      "id": "SUPRCP"
    },
    {
      "name": "Summer Temperature",
      "id": "SUTEMP"
    },
    {
      "name": "Air Temperature",
      "id": "TEMP"
    },
    {
      "name": "Velocity",
      "id": "VELOCITY"
    },
    {
      "name": "Vertical Integrated Liquid",
      "id": "VERTINTLIQUID"
    },
    {
      "name": "Water",
      "id": "WATER"
    },
    {
      "name": "Winter Agricultural",
      "id": "WIAGR"
    },
    {
      "name": "Winter Degree Days",
      "id": "WIDD"
    },
    {
      "name": "Wind",
      "id": "WIND"
    },
    {
      "name": "Winter Precipitation",
      "id": "WIPRCP"
    },
    {
      "name": "Winter Temperature",
      "id": "WITEMP"
    },
    {
      "name": "Weather Type",
      "id": "WXTYPE"
    }

    */
  });

  it('can return locations by category', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/locations?locationcategoryid=CNTRY', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

     */
  });

  it('can return locations by category hydro region', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/locations?locationcategoryid=HYD_REG', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

     */
  });

  it('can return a location by location id', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/locations/FIPS:NZ', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

    {
      "mindate": "1940-03-01",
      "maxdate": "2021-07-04",
      "name": "New Zealand",
      "datacoverage": 1,
      "id": "FIPS:NZ"
    }

     */
  });

  it('can return stations by location id', async () => {
    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?locationid=FIPS:NZ', { token: settings.noaaToken });

    console.log(JSON.stringify(JSON.parse(result.body), null, 2));

    /*

    {
  "metadata": {
    "resultset": {
      "offset": 1,
      "count": 13,
      "limit": 25
    }
  },
  "results": [
    {
      "elevation": 54,
      "mindate": "1965-12-31",
      "maxdate": "2021-07-04",
      "latitude": -35.1,
      "name": "KAITAIA, NZ",
      "datacoverage": 0.9426,
      "id": "GHCND:NZ000093012",
      "elevationUnit": "METERS",
      "longitude": 173.267
    },
    {
      "elevation": 5,
      "mindate": "1962-02-01",
      "maxdate": "2021-07-04",
      "latitude": -38.65,
      "name": "GISBORNE AERODROME, NZ",
      "datacoverage": 1,
      "id": "GHCND:NZ000093292",
      "elevationUnit": "METERS",
      "longitude": 177.983
    },
    {
      "elevation": 7,
      "mindate": "1972-01-01",
      "maxdate": "2021-07-04",
      "latitude": -40.9,
      "name": "PARAPARAUMU AWS, NZ",
      "datacoverage": 1,
      "id": "GHCND:NZ000093417",
      "elevationUnit": "METERS",
      "longitude": 174.983
    },
    {
      "elevation": 2,
      "mindate": "1948-05-01",
      "maxdate": "2021-07-04",
      "latitude": -46.417,
      "name": "INVERCARGILL AIRPOR, NZ",
      "datacoverage": 1,
      "id": "GHCND:NZ000093844",
      "elevationUnit": "METERS",
      "longitude": 168.333
    },
    {
      "elevation": 49,
      "mindate": "1940-03-01",
      "maxdate": "2021-07-04",
      "latitude": -29.25,
      "name": "RAOUL ISL KERMADEC, NZ",
      "datacoverage": 0.9113,
      "id": "GHCND:NZ000093994",
      "elevationUnit": "METERS",
      "longitude": -177.917
    },
    {
      "elevation": 32,
      "mindate": "1944-01-01",
      "maxdate": "2021-07-04",
      "latitude": -39.017,
      "name": "NEW PLYMOUTH AWS, NZ",
      "datacoverage": 1,
      "id": "GHCND:NZ000933090",
      "elevationUnit": "METERS",
      "longitude": 174.183
    },
    {
      "elevation": 40,
      "mindate": "1964-01-01",
      "maxdate": "2021-07-04",
      "latitude": -42.717,
      "name": "HOKITIKA AERODROME, NZ",
      "datacoverage": 1,
      "id": "GHCND:NZ000936150",
      "elevationUnit": "METERS",
      "longitude": 170.983
    },
    {
      "elevation": 488,
      "mindate": "1949-11-01",
      "maxdate": "2005-12-31",
      "latitude": -44.517,
      "name": "TARA HILLS, NZ",
      "datacoverage": 0.9837,
      "id": "GHCND:NZ000937470",
      "elevationUnit": "METERS",
      "longitude": 169.9
    },
    {
      "elevation": 49,
      "mindate": "1956-10-01",
      "maxdate": "2012-03-01",
      "latitude": -43.95,
      "name": "CHATHAM ISLANDS AWS, NZ",
      "datacoverage": 0.972,
      "id": "GHCND:NZ000939870",
      "elevationUnit": "METERS",
      "longitude": -176.567
    },
    {
      "elevation": 7,
      "mindate": "1994-08-01",
      "maxdate": "2021-07-04",
      "latitude": -37,
      "name": "AUCKLAND AERO AWS, NZ",
      "datacoverage": 0.9949,
      "id": "GHCND:NZM00093110",
      "elevationUnit": "METERS",
      "longitude": 174.8
    },
    {
      "elevation": 101,
      "mindate": "1997-01-01",
      "maxdate": "2021-07-04",
      "latitude": -42.417,
      "name": "KAIKOURA, NZ",
      "datacoverage": 0.9937,
      "id": "GHCND:NZM00093678",
      "elevationUnit": "METERS",
      "longitude": 173.7
    },
    {
      "elevation": 37.5,
      "mindate": "1954-03-02",
      "maxdate": "2021-07-04",
      "latitude": -43.489,
      "name": "CHRISTCHURCH INTERNATIONAL, NZ",
      "datacoverage": 0.9463,
      "id": "GHCND:NZM00093781",
      "elevationUnit": "METERS",
      "longitude": 172.532
    },
    {
      "elevation": 7,
      "mindate": "2005-01-01",
      "maxdate": "2021-07-04",
      "latitude": -41.3,
      "name": "WELLINGTON INTERNATIONAL, NZ",
      "datacoverage": 1,
      "id": "WBAN:00488",
      "elevationUnit": "METERS",
      "longitude": 174.8
    }
  ]
}


     */
  });
})

/*

   {
      "uid": "gov.noaa.ncdc:C00861",
      "mindate": "1763-01-01",
      "maxdate": "2021-07-03",
      "name": "Daily Summaries",
      "datacoverage": 1,
      "id": "GHCND"
    },
    {
      "uid": "gov.noaa.ncdc:C00946",
      "mindate": "1763-01-01",
      "maxdate": "2021-06-01",
      "name": "Global Summary of the Month",
      "datacoverage": 1,
      "id": "GSOM"
    },
    {
      "uid": "gov.noaa.ncdc:C00947",
      "mindate": "1763-01-01",
      "maxdate": "2021-01-01",
      "name": "Global Summary of the Year",
      "datacoverage": 1,
      "id": "GSOY"
    },
    {
      "uid": "gov.noaa.ncdc:C00345",
      "mindate": "1991-06-05",
      "maxdate": "2021-07-03",
      "name": "Weather Radar (Level II)",
      "datacoverage": 0.95,
      "id": "NEXRAD2"
    },
    {
      "uid": "gov.noaa.ncdc:C00708",
      "mindate": "1994-05-20",
      "maxdate": "2021-07-03",
      "name": "Weather Radar (Level III)",
      "datacoverage": 0.95,
      "id": "NEXRAD3"
    },
    {
      "uid": "gov.noaa.ncdc:C00821",
      "mindate": "2010-01-01",
      "maxdate": "2010-01-01",
      "name": "Normals Annual/Seasonal",
      "datacoverage": 1,
      "id": "NORMAL_ANN"
    },
    {
      "uid": "gov.noaa.ncdc:C00823",
      "mindate": "2010-01-01",
      "maxdate": "2010-12-31",
      "name": "Normals Daily",
      "datacoverage": 1,
      "id": "NORMAL_DLY"
    },
    {
      "uid": "gov.noaa.ncdc:C00824",
      "mindate": "2010-01-01",
      "maxdate": "2010-12-31",
      "name": "Normals Hourly",
      "datacoverage": 1,
      "id": "NORMAL_HLY"
    },
    {
      "uid": "gov.noaa.ncdc:C00822",
      "mindate": "2010-01-01",
      "maxdate": "2010-12-01",
      "name": "Normals Monthly",
      "datacoverage": 1,
      "id": "NORMAL_MLY"
    },
    {
      "uid": "gov.noaa.ncdc:C00505",
      "mindate": "1970-05-12",
      "maxdate": "2014-01-01",
      "name": "Precipitation 15 Minute",
      "datacoverage": 0.25,
      "id": "PRECIP_15"
    },
    {
      "uid": "gov.noaa.ncdc:C00313",
      "mindate": "1900-01-01",
      "maxdate": "2014-01-01",
      "name": "Precipitation Hourly",
      "datacoverage": 1,
      "id": "PRECIP_HLY"
    }

 */