import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'

export const render = (news, notifications) => {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  return renderBootstrapList(news, notifications);
}

// [i] https://getbootstrap.com/docs/5.0/examples/grid/
const renderBootstrapList = (news = [], n) => {
  const { 
    onDelete    = () => {}, 
    onBookmark  = () => {},
    onBlock     = () => {},
    onUnblock   = () => {} } = n;

  if (news.length === 0)
    return html`
      <div id="news">
        <table class="table table-hover">
          <tbody>
            <tr>
              <td colspan="2" align="center">
              <div class="alert alert-primary" role="alert">
                No news
              </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;

  return html`
    <div id="news">
      <table class="table table-hover">
        <tbody>
          ${news.map(
            (newsItem, i) => html`
            <tr class=${newsItem.hostIsBlocked ? 'blocked': 'xxx'}>
              <td width="10" style="vertical-align: middle;text-align: center;">${i+1}</td>
              <td width="10" style="vertical-align: middle;text-align: center;">
                <a href="javascript:void(0)" onclick=${() => onDelete(newsItem.id)} title=${'delete ' + newsItem.title} class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                  </svg>
                </a>
              </td>
              <td>
                <div>
                  <a href="${newsItem.url}"><span class="news-title">${newsItem.title}</span></a>
                </div>
                <div>
                  <a href="javascript:void(0)" onclick=${() => onBookmark(newsItem.id)} title=${'bookmark ' + newsItem.title} class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                    </svg>
                  </a>
                  <span class=${'source' + ' ' + newsItem.label} title=${newsItem.label + ' article'}>
                    ${newsItem.label == 'hn' ? '🅷' : '🅻'} <!-- https://fsymbols.com/generators/smallcaps/ -->
                  </span>
                  <span class="age">${newsItem.ageSince(window.application.now())}</span>
                  <span class="host">
                    <a href="javascript:void(0)" 
                      data-toggle="tooltip" 
                      data-placement="top" 
                      title=${(newsItem.hostIsBlocked ? 'unblock': 'block') + ' ' + newsItem.host} 
                      class="badge badge-danger" 
                      onclick=${newsItem.hostIsBlocked ? () => onUnblock(newsItem.host): () => onBlock(newsItem.host)}>${newsItem.hostIsBlocked ? 'unblock': 'block'} ${newsItem.host}</a>
                  </span>
                </div>
              </td>
            </tr>
            `
          )}
        </tbody>
      </table>
    </div>`
};