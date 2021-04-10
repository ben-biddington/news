import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import './weather';
import './bin';
import './menu';

/* [i] withStyles fails with:

Uncaught TypeError: this._processStyle(...).then is not a function
    _injectStyles webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    created webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    _init webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    _checkInit webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    connectedCallback webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    createComponent webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    <anonymous> webpack://[name]/./src/adapters/web/gui/flavours/ficus/src/main.js?:9
    js http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:131
    __webpack_require__ http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:30
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:94
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:97
    webpackUniversalModuleDefinition http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:9
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:10

*/

createComponent('ficus-application', {
  renderer,
  props: {
    baseUrl : '' 
  },
  state () {
    return { 
      lobstersNews: [],
      hackerNews: [],
      weather: [],
      deletedItems: {
        count: 0
      },
      uiOptions: {},
    }
  },
  styles () {
    console.log('Applying style');
    return `
      .mdc-data-table {
        background-color: #fff;
        background-color: var(--mdc-theme-surface, #fff);
        border-radius: 4px;
        border-width: 1px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.12);
        display: inline-flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow-x: auto;
      }

      .mdc-data-table__header-cell {
        color: rgba(0, 0, 0, 0.87);
      }

      .mdc-data-table__table {
        white-space: nowrap;
        border-collapse: collapse;
      }
      .mdc-data-table__cell {
        font-family: Roboto, sans-serif;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 400;
        letter-spacing: 0.0178571429em;
        text-transform: inherit;
      }
      `
  },
  // [i] https://github.com/WebReflection/uhtml
  render () {
    const weatherProps = JSON.stringify(this.state.weather, null, 2); /* https://github.com/ficusjs/ficusjs/blob/master/src/component.js#L182 */

    return html`
      <div id="application">
        <div id="header">
          <ficus-menu />
          <ficus-weather weather=${weatherProps} />
          <ficus-bin count=${this.state.deletedItems.count} />
        </div>
        <div id="news">
          <ol>
            ${this.news().map(
              (newsItem, i) => html`
                <li class=${'news item ' + (newsItem.hostIsBlocked ? 'blocked': '')}>
                  <a href="javascript:void(0)" onclick=${() => this.delete(newsItem.id)} title=${'delete ' + newsItem.title} class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                      <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                    </svg>
                  </a>
                  <a href="javascript:void(0)" onclick=${() => this.bookmark(newsItem.id)} title=${'bookmark ' + newsItem.title} class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                    </svg>
                  </a>
                  <a href="${newsItem.url}">${newsItem.title}</a>
                  <div>
                    <span class="age">${newsItem.ageSince(window.application.now())}</span>
                    <span class="host"><a href="javascript:void(0)" onclick=${() => this.block(newsItem.host)}>${newsItem.host}</a></span>
                    <span class="source">${newsItem.label}</span>
                    <!-- https://maketext.io/ -->
                    <!--
                    <svg width="87.88001708984375px" height="40.48001708984375px" xmlns="http://www.w3.org/2000/svg" viewBox="206.05999145507812 54.75999145507812 87.88001708984375 40.48001708984375" style="background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;" preserveAspectRatio="xMidYMid"><defs><filter id="editing-hole" x="-100%" y="-100%" width="300%" height="300%"><feFlood flood-color="#000" result="black"></feFlood><feMorphology operator="dilate" radius="2" in="SourceGraphic" result="erode"></feMorphology><feGaussianBlur in="erode" stdDeviation="4" result="blur"></feGaussianBlur><feOffset in="blur" dx="2" dy="2" result="offset"></feOffset><feComposite operator="atop" in="offset" in2="black" result="merge"></feComposite><feComposite operator="in" in="merge" in2="SourceGraphic" result="inner-shadow"></feComposite></filter></defs><g filter="url(#editing-hole)"><g transform="translate(225.73046684265137, 78.62500190734863)"><path d="M0.95 0L0.95-7.02L1.87-7.02L1.87-0.75L4.75-0.75L4.75 0L0.95 0ZM11.79-3.51L11.79-3.51L11.79-3.51Q11.79-1.75 10.99-0.82L10.99-0.82L10.99-0.82Q10.20 0.12 8.71 0.12L8.71 0.12L8.71 0.12Q7.23 0.12 6.43-0.81L6.43-0.81L6.43-0.81Q5.63-1.74 5.63-3.51L5.63-3.51L5.63-3.51Q5.63-5.27 6.43-6.20L6.43-6.20L6.43-6.20Q7.24-7.13 8.71-7.13L8.71-7.13L8.71-7.13Q10.20-7.13 10.99-6.19L10.99-6.19L10.99-6.19Q11.79-5.26 11.79-3.51ZM10.84-3.51L10.84-3.51L10.84-3.51Q10.84-4.87 10.31-5.62L10.31-5.62L10.31-5.62Q9.78-6.36 8.70-6.36L8.70-6.36L8.70-6.36Q7.62-6.36 7.09-5.61L7.09-5.61L7.09-5.61Q6.57-4.85 6.57-3.51L6.57-3.51L6.57-3.51Q6.57-2.85 6.69-2.33L6.69-2.33L6.69-2.33Q6.82-1.81 7.07-1.43L7.07-1.43L7.07-1.43Q7.33-1.05 7.74-0.85L7.74-0.85L7.74-0.85Q8.15-0.65 8.70-0.65L8.70-0.65L8.70-0.65Q9.78-0.65 10.31-1.40L10.31-1.40L10.31-1.40Q10.84-2.15 10.84-3.51ZM13.19-7.02L15.41-7.02L15.41-7.02Q15.90-7.02 16.34-6.95L16.34-6.95L16.34-6.95Q16.78-6.87 17.10-6.68L17.10-6.68L17.10-6.68Q17.43-6.49 17.62-6.16L17.62-6.16L17.62-6.16Q17.81-5.83 17.81-5.33L17.81-5.33L17.81-5.33Q17.81-5.02 17.74-4.79L17.74-4.79L17.74-4.79Q17.68-4.56 17.55-4.38L17.55-4.38L17.55-4.38Q17.43-4.19 17.25-4.06L17.25-4.06L17.25-4.06Q17.07-3.94 16.85-3.85L16.85-3.85L16.85-3.84L16.85-3.84Q17.11-3.77 17.36-3.63L17.36-3.63L17.36-3.63Q17.61-3.49 17.79-3.27L17.79-3.27L17.79-3.27Q17.98-3.05 18.09-2.75L18.09-2.75L18.09-2.75Q18.20-2.45 18.20-2.07L18.20-2.07L18.20-2.07Q18.20-1.51 18.00-1.12L18.00-1.12L18.00-1.12Q17.81-0.73 17.46-0.48L17.46-0.48L17.46-0.48Q17.12-0.23 16.65-0.12L16.65-0.12L16.65-0.12Q16.19 0 15.64 0L15.64 0L13.19 0L13.19-7.02ZM14.11-4.14L15.39-4.14L15.39-4.14Q15.74-4.14 16.02-4.19L16.02-4.19L16.02-4.19Q16.30-4.25 16.49-4.39L16.49-4.39L16.49-4.39Q16.68-4.53 16.79-4.76L16.79-4.76L16.79-4.76Q16.89-5.00 16.89-5.34L16.89-5.34L16.89-5.34Q16.89-5.63 16.77-5.82L16.77-5.82L16.77-5.82Q16.65-6.01 16.44-6.12L16.44-6.12L16.44-6.12Q16.23-6.23 15.96-6.27L15.96-6.27L15.96-6.27Q15.68-6.31 15.39-6.31L15.39-6.31L14.11-6.31L14.11-4.14ZM14.11-0.71L15.64-0.71L15.64-0.71Q15.99-0.71 16.29-0.80L16.29-0.80L16.29-0.80Q16.59-0.89 16.81-1.06L16.81-1.06L16.81-1.06Q17.03-1.23 17.15-1.48L17.15-1.48L17.15-1.48Q17.28-1.74 17.28-2.07L17.28-2.07L17.28-2.07Q17.28-2.40 17.15-2.65L17.15-2.65L17.15-2.65Q17.03-2.91 16.81-3.08L16.81-3.08L16.81-3.08Q16.59-3.25 16.29-3.33L16.29-3.33L16.29-3.33Q15.99-3.42 15.64-3.42L15.64-3.42L14.11-3.42L14.11-0.71ZM19.22-0.30L19.51-1.02L19.51-1.02Q19.71-0.94 19.93-0.87L19.93-0.87L19.93-0.87Q20.16-0.81 20.39-0.76L20.39-0.76L20.39-0.76Q20.62-0.71 20.85-0.68L20.85-0.68L20.85-0.68Q21.09-0.65 21.31-0.65L21.31-0.65L21.31-0.65Q21.70-0.65 22.01-0.74L22.01-0.74L22.01-0.74Q22.32-0.83 22.55-0.99L22.55-0.99L22.55-0.99Q22.77-1.16 22.90-1.41L22.90-1.41L22.90-1.41Q23.02-1.66 23.02-1.97L23.02-1.97L23.02-1.97Q23.02-2.29 22.90-2.49L22.90-2.49L22.90-2.49Q22.79-2.70 22.57-2.83L22.57-2.83L22.57-2.83Q22.35-2.97 22.04-3.06L22.04-3.06L22.04-3.06Q21.72-3.16 21.31-3.26L21.31-3.26L21.31-3.26Q20.86-3.38 20.49-3.52L20.49-3.52L20.49-3.52Q20.11-3.67 19.83-3.90L19.83-3.90L19.83-3.90Q19.56-4.13 19.40-4.47L19.40-4.47L19.40-4.47Q19.24-4.80 19.24-5.31L19.24-5.31L19.24-5.31Q19.24-5.73 19.41-6.06L19.41-6.06L19.41-6.06Q19.58-6.40 19.88-6.64L19.88-6.64L19.88-6.64Q20.18-6.88 20.61-7.00L20.61-7.00L20.61-7.00Q21.03-7.13 21.54-7.13L21.54-7.13L21.54-7.13Q21.79-7.13 22.05-7.10L22.05-7.10L22.05-7.10Q22.31-7.07 22.56-7.01L22.56-7.01L22.56-7.01Q22.82-6.96 23.06-6.88L23.06-6.88L23.06-6.88Q23.31-6.80 23.52-6.71L23.52-6.71L23.23-5.99L23.23-5.99Q23.05-6.05 22.87-6.12L22.87-6.12L22.87-6.12Q22.69-6.19 22.48-6.25L22.48-6.25L22.48-6.25Q22.28-6.30 22.04-6.33L22.04-6.33L22.04-6.33Q21.81-6.36 21.54-6.36L21.54-6.36L21.54-6.36Q21.27-6.36 21.03-6.30L21.03-6.30L21.03-6.30Q20.79-6.25 20.60-6.12L20.60-6.12L20.60-6.12Q20.41-6.00 20.30-5.80L20.30-5.80L20.30-5.80Q20.19-5.60 20.19-5.31L20.19-5.31L20.19-5.31Q20.19-5.00 20.30-4.79L20.30-4.79L20.30-4.79Q20.42-4.59 20.63-4.45L20.63-4.45L20.63-4.45Q20.85-4.32 21.17-4.22L21.17-4.22L21.17-4.22Q21.48-4.13 21.89-4.02L21.89-4.02L21.89-4.02Q22.34-3.91 22.72-3.76L22.72-3.76L22.72-3.76Q23.10-3.62 23.37-3.39L23.37-3.39L23.37-3.39Q23.65-3.16 23.80-2.82L23.80-2.82L23.80-2.82Q23.96-2.48 23.96-1.97L23.96-1.97L23.96-1.97Q23.96-1.44 23.76-1.05L23.76-1.05L23.76-1.05Q23.56-0.65 23.21-0.40L23.21-0.40L23.21-0.40Q22.86-0.14 22.37-0.01L22.37-0.01L22.37-0.01Q21.88 0.12 21.31 0.12L21.31 0.12L21.31 0.12Q20.23 0.12 19.22-0.30L19.22-0.30ZM24.89-6.27L24.89-7.02L30.15-7.02L30.15-6.27L27.99-6.27L27.99 0L27.07 0L27.07-6.27L24.89-6.27ZM31.43 0L31.43-7.02L35.32-7.02L35.32-6.27L32.34-6.27L32.34-4.33L34.45-4.33L34.45-3.58L32.34-3.58L32.34-0.75L35.43-0.75L35.43 0L31.43 0ZM36.96-7.02L39.16-7.02L39.16-7.02Q39.62-7.02 40.04-6.91L40.04-6.91L40.04-6.91Q40.45-6.81 40.77-6.57L40.77-6.57L40.77-6.57Q41.09-6.33 41.27-5.97L41.27-5.97L41.27-5.97Q41.46-5.60 41.46-5.10L41.46-5.10L41.46-5.10Q41.46-4.60 41.27-4.24L41.27-4.24L41.27-4.24Q41.09-3.87 40.77-3.63L40.77-3.63L40.77-3.63Q40.52-3.45 40.21-3.34L40.21-3.34L40.21-3.34Q39.91-3.24 39.56-3.20L39.56-3.20L39.56-3.19L39.56-3.19Q39.70-3.10 39.87-2.93L39.87-2.93L39.87-2.93Q40.04-2.76 40.22-2.53L40.22-2.53L40.22-2.53Q40.41-2.30 40.61-2.04L40.61-2.04L40.61-2.04Q40.80-1.77 41.00-1.48L41.00-1.48L42.02 0L40.94 0L39.84-1.71L39.84-1.71Q39.54-2.18 39.32-2.47L39.32-2.47L39.32-2.47Q39.11-2.75 38.91-2.92L38.91-2.92L38.91-2.92Q38.72-3.09 38.52-3.14L38.52-3.14L38.52-3.14Q38.32-3.20 38.06-3.20L38.06-3.20L37.87-3.20L37.87 0L36.96 0L36.96-7.02ZM37.87-3.92L39.16-3.92L39.16-3.92Q39.47-3.92 39.72-3.98L39.72-3.98L39.72-3.98Q39.98-4.05 40.16-4.20L40.16-4.20L40.16-4.20Q40.34-4.34 40.44-4.57L40.44-4.57L40.44-4.57Q40.55-4.79 40.55-5.10L40.55-5.10L40.55-5.10Q40.55-5.42 40.44-5.64L40.44-5.64L40.44-5.64Q40.34-5.86 40.16-6.01L40.16-6.01L40.16-6.01Q39.98-6.15 39.72-6.22L39.72-6.22L39.72-6.22Q39.47-6.29 39.16-6.29L39.16-6.29L37.87-6.29L37.87-3.92ZM42.85-0.30L43.14-1.02L43.14-1.02Q43.34-0.94 43.56-0.87L43.56-0.87L43.56-0.87Q43.78-0.81 44.02-0.76L44.02-0.76L44.02-0.76Q44.25-0.71 44.48-0.68L44.48-0.68L44.48-0.68Q44.72-0.65 44.94-0.65L44.94-0.65L44.94-0.65Q45.33-0.65 45.64-0.74L45.64-0.74L45.64-0.74Q45.95-0.83 46.18-0.99L46.18-0.99L46.18-0.99Q46.40-1.16 46.52-1.41L46.52-1.41L46.52-1.41Q46.65-1.66 46.65-1.97L46.65-1.97L46.65-1.97Q46.65-2.29 46.53-2.49L46.53-2.49L46.53-2.49Q46.42-2.70 46.20-2.83L46.20-2.83L46.20-2.83Q45.98-2.97 45.66-3.06L45.66-3.06L45.66-3.06Q45.35-3.16 44.94-3.26L44.94-3.26L44.94-3.26Q44.49-3.38 44.11-3.52L44.11-3.52L44.11-3.52Q43.74-3.67 43.46-3.90L43.46-3.90L43.46-3.90Q43.18-4.13 43.03-4.47L43.03-4.47L43.03-4.47Q42.87-4.80 42.87-5.31L42.87-5.31L42.87-5.31Q42.87-5.73 43.04-6.06L43.04-6.06L43.04-6.06Q43.20-6.40 43.51-6.64L43.51-6.64L43.51-6.64Q43.81-6.88 44.23-7.00L44.23-7.00L44.23-7.00Q44.66-7.13 45.17-7.13L45.17-7.13L45.17-7.13Q45.42-7.13 45.68-7.10L45.68-7.10L45.68-7.10Q45.94-7.07 46.19-7.01L46.19-7.01L46.19-7.01Q46.45-6.96 46.69-6.88L46.69-6.88L46.69-6.88Q46.93-6.80 47.15-6.71L47.15-6.71L46.86-5.99L46.86-5.99Q46.68-6.05 46.50-6.12L46.50-6.12L46.50-6.12Q46.31-6.19 46.11-6.25L46.11-6.25L46.11-6.25Q45.90-6.30 45.67-6.33L45.67-6.33L45.67-6.33Q45.44-6.36 45.17-6.36L45.17-6.36L45.17-6.36Q44.90-6.36 44.66-6.30L44.66-6.30L44.66-6.30Q44.41-6.25 44.23-6.12L44.23-6.12L44.23-6.12Q44.04-6.00 43.93-5.80L43.93-5.80L43.93-5.80Q43.81-5.60 43.81-5.31L43.81-5.31L43.81-5.31Q43.81-5.00 43.93-4.79L43.93-4.79L43.93-4.79Q44.04-4.59 44.26-4.45L44.26-4.45L44.26-4.45Q44.48-4.32 44.79-4.22L44.79-4.22L44.79-4.22Q45.11-4.13 45.52-4.02L45.52-4.02L45.52-4.02Q45.97-3.91 46.35-3.76L46.35-3.76L46.35-3.76Q46.72-3.62 47.00-3.39L47.00-3.39L47.00-3.39Q47.28-3.16 47.43-2.82L47.43-2.82L47.43-2.82Q47.59-2.48 47.59-1.97L47.59-1.97L47.59-1.97Q47.59-1.44 47.39-1.05L47.39-1.05L47.39-1.05Q47.19-0.65 46.84-0.40L46.84-0.40L46.84-0.40Q46.48-0.14 46.00-0.01L46.00-0.01L46.00-0.01Q45.51 0.12 44.94 0.12L44.94 0.12L44.94 0.12Q43.86 0.12 42.85-0.30L42.85-0.30Z" fill="#ccc"></path></g></g><style>text {
                      font-size: 64px;
                      font-family: Arial Black;
                      dominant-baseline: central;
                      text-anchor: middle;
                    }</style></svg>
                    -->
                  </div>
                </li>
                `
            )}
          </ol>
        </div>
        ${this.marineWeather()}
      </div>
    `
  },
  block(host) { 
    console.log(`Blocking host <${host}>`);
    return window.application.news.block(host);
  },
  marineWeather() {
    if (false === this.state.uiOptions.showMarineWeather)
      return null;
    
      return [ 'wellington', 'titahi-bay', 'craps', 'riversdale-beach', 'the-cut' ].map(name =>
        html`
          <div class="mdc-data-table" style="margin:10px">
            <table class="mdc-data-table__table">
              <thead>
                <tr class="mdc-data-table__header-row">
                  <th class="mdc-data-table__header-cell" role="columnheader" scope="col">${name}</th>
                </tr>
              </thead>
              <tbody class="mdc-data-table__content">
                <tr class="mdc-data-table__row">
                  <td class="mdc-data-table__cell"><img src=${'/marine-weather/' + name}  alt="Marine weather"></td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      );
  },
  news() {
    const result = this.state.lobstersNews.concat(this.state.hackerNews);

    result.sort((a,b) => new Date(a.date) < new Date(b.date));

    return result;
  },
  connectedCallback() {},
  async created () {
    window.application.on("lobsters-items-loaded", e => {
      this.setState(state => {
        return {...state, lobstersNews: e.items.map(it => it.clone(item => item.label = 'lobsters')) };
      });
    });
    
    window.application.on("hacker-news-items-loaded", e => {
      this.setState(state => {
        return {...state, hackerNews: e.items.map(it => it.clone(item => item.label = 'hn')) };
      });
    });

    window.application.on(
      [ "lobsters-item-deleted", "lobsters-item-snoozed" ], 
      e => {
        this.setState(state => {
          return {...state, lobstersNews: state.lobstersNews.filter(it => it.id != e.id) };
        });
      }
    );

    window.application.on(
      [ "hacker-news-item-deleted", "hacker-news-item-snoozed" ], 
      e => {
        this.setState(state => ({...state, hackerNews: state.hackerNews.filter(it => it.id != e.id) }));
      }
    );

    window.application.on(
      [ "weather-loaded" ], 
      e => {
        this.setState(state => ({...state, weather: e.weather }));
      }
    );

    window.application.on(
      [ "hacker-news-item-deleted", "lobsters-item-deleted" ], 
      async _ => {
        const deletedCount = await window.application.deletedItems.count();
        this.setState(state => ({...state, deletedItems: { count: deletedCount } } ));
      }
    );

    window.application.on(
      [ "toggle-saved" ], 
      async e => {
        await this.loadToggles();
        console.log('Reloaded toggles', JSON.stringify(e, null, 2));
        console.log(JSON.stringify(this.state.uiOptions, null, 2));
      }
    );

    this.props.baseUrl = window.settings.get('baseUrl') || '';

    return Promise.all([
      this.loadToggles(),
      window.application.weather.sevenDays(),
      window.application.lobsters.list().
        then(result => {
          this.setState(state => {
            return {...state, lobstersNews: result.map(it => it.clone(item => item.label = 'lobsters')) };
          });
        }),
      window.application.hackerNews.list().
        then(result => {
          this.setState(state => {
            return {...state, hackerNews: result.map(it => it.clone(item => item.label = 'hn')) };
          });
        }),
      window.application.deletedItems.count().then(count => {
        this.setState(state => {
          return {...state, deletedItems: { count } };
        });
      })
    ]);
  },
  async loadToggles() {
    const toggles = await window.application.toggles.list();
    
    this.setState(state => {
        return {
        ...state, 
        uiOptions: {
          showDeleted       : toggles.showDeleted.isOn,
          showMarineWeather : toggles.showMarineWeather.isOn
        } 
      };
    });
  },
  pop() {
    this.setState(state => ({...state, clicks: state.clicks + 1 }));
  },
  delete(id) {
    console.log(`Deleting <${id}>`);
    window.application.lobsters.delete(id);
    window.application.hackerNews.delete(id);
  },
  bookmark(id) {
    console.log(`Bookmarking <${id}>`);
    window.application.bookmarks.add(id);
  }
})