// https://www.metservice.com/towns-cities/locations/wellington/7-days
export const icon = (name, size = 32) => {
  console.log(`Finding icon for ${JSON.stringify(name, null, 2)}`);

  if (!icons[name]) {
    console.log(`Unable to find symbol for name <${name}>`);
  }

  return <>{(icons[name] || icons['missing'])(size)}</>;
}

const icons = {};

//
// [!] Forced to store functions that return fragments rather than just the fragments, 
//     otherwise for some reason only the first time you request an icon by name return gets a value.
//     Subsequent requests for the same name return empty. Why?
//
icons['partly-cloudy'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.o()rg/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-partly-cloudy">
      <symbol id="condition-partly-cloudy" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(12 4)">
            <path d="m3 3h13v13h-13z" fill="#eea80e"></path>
            <path d="m9.192 0 9.193 9.192-9.193 9.192-9.192-9.192z" fill="#eea80e"></path>
            <circle cx="9.5" cy="9.5" fill="#fec157" r="6.5"></circle>
          </g>
          <path d="m20.542 15h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z" fill="#f2f4f4"></path>
          <g fill="#aaa" fill-rule="nonzero">
            <path d="m24.5 16h-4.692l-.22-.7a9.004 9.004 0 0 0 -8.588-6.3 9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z"></path>
            <path d="m11 28v-1a9 9 0 1 1 9-9c0 .94-.144 1.86-.424 2.738l.953.304c.306-.96.471-1.981.471-3.042 0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10z"></path>
          </g>
        </g>
      </symbol>
    </use>
  </svg>
  </>
;

icons['few-showers'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-few-showers">
      <symbol id="condition-few-showers" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g fill="#6eb6ff" transform="translate(4 19)">
            <rect height="6" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 3.607654 -7.267947)" width="2" x="14.366" y=".098"></rect>
            <rect height="8" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 2.63392 -1.901925)" width="2" x="3.866" y="-.036"></rect>
            <rect height="4" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 6.205743 -4.696147)" width="2" x="10.866" y="7.232"></rect>
            <rect height="3" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 5.116003 .504817)" width="2" x=".616" y="8.299"></rect>
            <rect height="5" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 4.919838 -3.031085)" width="2" x="7.116" y="5.165"></rect>
            <rect height="5" rx="1" transform="matrix(.8660254 .5 -.5 .8660254 2.821762 -5.200958)" width="2" x="10.116" y=".165"></rect>
          </g>
          <path d="m13 4h13v13h-13z" fill="#eea80e"></path>
          <path d="m19.192 1 9.193 9.192-9.193 9.192-9.192-9.192z" fill="#eea80e"></path>
          <circle cx="19.5" cy="10.5" fill="#fec157" r="6.5"></circle>
          <path d="m17.826 14h2.674a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -3.5 3.5h-9a6.5 6.5 0 1 1 6.326-8z" fill="#f2f4f4"></path>
          <g fill="#aaa" fill-rule="nonzero">
            <path d="m20.5 15h-3.465l-.182-.77a5.5 5.5 0 1 0 -5.353 6.77h9a2.5 2.5 0 0 0 2.5-2.5v-1a2.5 2.5 0 0 0 -2.5-2.5zm0-1a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -3.5 3.5h-9a6.5 6.5 0 1 1 6.326-8z"></path>
            <path d="m11.5 22v-1a5.5 5.5 0 1 1 5.241-3.827l.953.304a6.5 6.5 0 1 0 -6.194 4.523z"></path>
          </g>
        </g>
      </symbol>
    </use>
  </svg>
</>
;

icons['showers'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-showers">
      <symbol id="condition-showers" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g fill="#6EB6FF" transform="translate(6 18)">
            <rect width="2" height="4" x="11.866" y="8.232" rx="1" transform="rotate(30 12.866 10.232)"></rect>
            <rect width="2" height="5" x="7.116" y="6.165" rx="1" transform="rotate(30 8.116 8.665)"></rect>
            <rect width="2" height="5" x="10.116" y="1.165" rx="1" transform="rotate(30 11.116 3.665)"></rect>
            <rect width="2" height="6" x="15.366" y="1.098" rx="1" transform="rotate(30 16.366 4.098)"></rect>
            <rect width="2" height="6" x="4.366" y="1.098" rx="1" transform="rotate(30 5.366 4.098)"></rect>
            <rect width="2" height="3" x=".616" y="8.299" rx="1" transform="rotate(30 1.616 9.799)"></rect>
          </g>
          <path fill="#AAA" d="M20.542 9H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#616161" fill-rule="nonzero" d="M24.5 10h-4.692l-.22-.7A9.004 9.004 0 0 0 11 3a9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#616161" fill-rule="nonzero" d="M11 22v-1a9 9 0 1 1 9-9c0 .272-.01.505-.035.992-.06 1.108-.06 1.572.05 2.185L21 15c-.165-.917 0-1.94 0-3 0-5.523-4.477-10-10-10S1 6.477 1 12s4.477 10 10 10z"></path>
        </g>
      </symbol>
    </use>
  </svg>
</>;

icons['fine'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-fine">
      <symbol id="condition-fine" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <path d="m12.142 6 4-4 4 4h5.858v5.858l4.284 4.284-4.284 4.284v5.574h-5.574l-4.284 4.284-4.284-4.284h-5.858v-5.858l-4-4 4-4v-6.142z" fill="#eea80e"></path>
          <circle cx="16" cy="16" fill="#fec157" r="10"></circle>
        </g>
      </symbol>
    </use>
  </svg>
</>;

icons['cloudy'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-cloudy">
      <symbol id="condition-cloudy" viewBox={`0 0 ${size} ${size}`}>
      <g fill="none" fill-rule="evenodd">
        <path d="m20.542 13h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z" fill="#f2f4f4"></path>
        <g fill="#aaa" fill-rule="nonzero">
          <path d="m24.5 14h-4.692l-.22-.7a9.004 9.004 0 0 0 -8.588-6.3 9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z"></path>
          <path d="m11 26v-1a9 9 0 1 1 9-9c0 .94-.144 1.86-.424 2.738l.953.304c.306-.96.471-1.981.471-3.042 0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10z"></path>
        </g>
      </g>
      </symbol>
    </use>
  </svg>
</>

icons['rain'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-rain">
      <symbol id="condition-rain" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g fill="#6EB6FF" transform="translate(5 18)">
            <rect width="2" height="3" x="9.616" y="9.299" rx="1" transform="rotate(30 10.616 10.799)"></rect>
            <rect width="2" height="3" x=".616" y="9.299" rx="1" transform="rotate(30 1.616 10.799)"></rect>
            <rect width="2" height="4" x="5.866" y="7.232" rx="1" transform="rotate(30 6.866 9.232)"></rect>
            <rect width="2" height="4" x="17.866" y="1.232" rx="1" transform="rotate(30 18.866 3.232)"></rect>
            <rect width="2" height="6" x="14.366" y="6.098" rx="1" transform="rotate(30 15.366 9.098)"></rect>
            <rect width="2" height="6" x="9.366" y=".098" rx="1" transform="rotate(30 10.366 3.098)"></rect>
            <rect width="2" height="6" x="13.366" y="1.098" rx="1" transform="rotate(30 14.366 4.098)"></rect>
            <rect width="2" height="8" x="3.866" y="-.036" rx="1" transform="rotate(30 4.866 3.964)"></rect>
          </g>
          <path fill="#606060" d="M20.542 9H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#474747" fill-rule="nonzero" d="M24.5 10h-4.692l-.22-.7A9.004 9.004 0 0 0 11 3a9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#474747" fill-rule="nonzero" d="M11 22v-1a9 9 0 1 1 9-9c0 .94-.144 1.86-.424 2.738l.953.304c.306-.96.471-1.981.471-3.042 0-5.523-4.477-10-10-10S1 6.477 1 12s4.477 10 10 10z"></path>
        </g>
      </symbol>
    </use>
  </svg>
</>

icons['windy'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-windy">
      <symbol id="condition-windy" viewBox={`0 0 ${size} ${size}`}>
        <g fill="#909AB5" fill-rule="nonzero">
          <path d="M13.497 9.166c1.162 0 2.347-.02 3.497-.172 1.244-.164 2.669-.408 3.832-1.237 1.305-.93 2.043-2.629 1.795-4.13-.34-2.058-1.998-3.61-3.859-3.61a3.64 3.64 0 00-2.798 1.277c-.704.818-1.035 1.906-.884 2.913a.99.99 0 101.96-.292c-.066-.438.097-.947.425-1.327.232-.27.645-.59 1.297-.59.99 0 1.746.991 1.904 1.95.128.773-.289 1.696-.99 2.196-.792.565-1.933.754-2.94.887-1.234.162-2.58.157-3.882.153l-.63-.001H2.209a.99.99 0 000 1.98l10.64.002.649.001z"></path>
          <path d="M24.773 12.555c.528 0 1.05 0 1.557-.002 2.49-.005 3.19-.528 4.212-1.453 1.157-1.046 1.725-2.612 1.481-4.084-.339-2.058-1.998-3.61-3.858-3.61a3.64 3.64 0 00-2.798 1.278c-.704.817-1.035 1.906-.885 2.913a.99.99 0 101.96-.293c-.066-.438.097-.946.425-1.326.232-.27.646-.59 1.298-.59.99 0 1.746.991 1.904 1.95.135.815-.194 1.694-.856 2.294-.775.7-1.036.937-2.887.94-1.015.003-2.095.002-3.156.001H1.026a.99.99 0 000 1.98l22.143.001h1.604zm-11.178 9.43c.648 0 1.284-.184 1.777-.483.97-.587 1.568-1.61 1.641-2.81.084-1.369-.504-2.722-1.535-3.533-1.19-.935-2.545-1.066-3.832-1.068a1269.13 1269.13 0 00-3.16 0H3.398a.99.99 0 000 1.98h8.243c1.078.002 1.934.113 2.612.645.51.402.825 1.148.782 1.856-.024.387-.162.916-.69 1.235-.423.257-1.032.268-1.33.026-.37-.302-.377-.87-.28-1.018a.99.99 0 00-1.656-1.085c-.714 1.089-.4 2.756.687 3.64.533.433 1.186.615 1.828.615z"></path>
        </g>
      </symbol>
    </use>
  </svg>
</>;

icons['drizzle'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-drizzle">
      <symbol id="condition-drizzle" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g fill="#6eb6ff">
            <rect height="5" rx="1" width="2" x="21" y="19"></rect>
            <rect height="4" rx="1" width="2" x="21" y="27"></rect>
            <rect height="5" rx="1" width="2" x="11" y="26"></rect>
            <rect height="5" rx="1" width="2" x="16" y="17"></rect>
            <rect height="5" rx="1" width="2" x="11" y="17"></rect>
            <rect height="6" rx="1" width="2" x="16" y="24"></rect>
          </g>
          <path d="m20.542 8h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z" fill="#f2f4f4"></path>
          <g fill="#aaa" fill-rule="nonzero">
            <path d="m24.5 9h-4.692l-.22-.7a9.004 9.004 0 0 0 -8.588-6.3 9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1h3.958a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004-.092.004-.184.004-.277.004-5.523 0-10-4.477-10-10s4.477-10 10-10c4.478 0 8.268 2.943 9.542 7z"></path>
            <path d="m11 21v-1a9 9 0 1 1 9-9c0 .94-.144 1.86-.424 2.738l.953.304c.306-.96.471-1.981.471-3.042 0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10z"></path>
          </g>
        </g>
      </symbol>
    </use>
  </svg>
</>;

icons['wind-rain'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <use xlink:href="#condition-wind-rain">
        <symbol id="condition-wind-rain" viewBox={`0 0 ${size} ${size}`}>
        <g fill="none" fill-rule="evenodd">
          <g fill="#6EB6FF" transform="translate(5 18)">
            <rect width="2" height="3" x="9.616" y="9.299" rx="1" transform="rotate(30 10.616 10.799)"></rect>
            <rect width="2" height="3" x=".616" y="9.299" rx="1" transform="rotate(30 1.616 10.799)"></rect>
            <rect width="2" height="4" x="5.866" y="7.232" rx="1" transform="rotate(30 6.866 9.232)"></rect>
            <rect width="2" height="4" x="17.866" y="1.232" rx="1" transform="rotate(30 18.866 3.232)"></rect>
            <rect width="2" height="6" x="14.366" y="6.098" rx="1" transform="rotate(30 15.366 9.098)"></rect>
            <rect width="2" height="6" x="9.366" y=".098" rx="1" transform="rotate(30 10.366 3.098)"></rect>
            <rect width="2" height="6" x="13.366" y="1.098" rx="1" transform="rotate(30 14.366 4.098)"></rect>
            <rect width="2" height="8" x="3.866" y="-.036" rx="1" transform="rotate(30 4.866 3.964)"></rect>
          </g>
          <path fill="#606060" d="M20.542 9H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#474747" fill-rule="nonzero" d="M24.5 10h-4.692l-.22-.7A9.004 9.004 0 0 0 11 3a9 9 0 1 0 .31 17.997l.19.003h13a5.5 5.5 0 0 0 0-11zm-3.958-1H24.5a6.5 6.5 0 1 1 0 13h-13c-.075 0-.15-.001-.223-.004C11.185 22 11.093 22 11 22 5.477 22 1 17.523 1 12S5.477 2 11 2c4.478 0 8.268 2.943 9.542 7z"></path>
          <path fill="#6EB6FF" fill-rule="nonzero" d="M8.5 18h15a.5.5 0 1 1 0 1h-15a2.5 2.5 0 1 1 2.5-2.5c0 .333-.167.5-.5.5-.333 0-.5-.167-.5-.5A1.5 1.5 0 1 0 8.5 18zm6-2h7a.5.5 0 1 1 0 1h-7a2.5 2.5 0 1 1 2.5-2.5c0 .333-.167.5-.5.5-.333 0-.5-.167-.5-.5a1.5 1.5 0 1 0-1.5 1.5z"></path>
          <path fill="#474747" fill-rule="nonzero" d="M11 22v-1a9 9 0 1 1 9-9c0 .94-.144 1.86-.424 2.738l.953.304c.306-.96.471-1.981.471-3.042 0-5.523-4.477-10-10-10S1 6.477 1 12s4.477 10 10 10z"></path>
        </g>
      </symbol>
    </use>
  </svg>
</>;

icons['missing'] = (size: number = 32) => <>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${size} ${size}`}>
    <circle r="50"/>
  </svg>
</>;