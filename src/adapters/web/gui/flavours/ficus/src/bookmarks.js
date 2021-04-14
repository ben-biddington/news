import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'

createComponent('ficus-bookmarks', {
  renderer,
  props: {
    bookmarks: {
      type: Object,
      default: [],
      required: false,
      observed: true 
    },
    visible: {
      type: Boolean,
      default: true,
      required: false,
      observed: true 
    }
  },
  render() {
    const cssClass = this.props.visible === true ? 'visible': 'hidden';

    return html`
      <div id="bookmarks" style=${'display:' + (this.props.visible ? 'block' : 'none')}>
        <table class="table table-hover">
          <thead class="recessed">
            <tr>
              <td colspan="3"><strong>Bookmarks</strong> (${this.props.bookmarks.length})</td>
            </tr>
          </thead>
          <tbody class=${cssClass}>
            ${this.props.bookmarks.map(
              (bookmark, i) => html`
              <tr>
                <td width="10" style="vertical-align: middle;text-align: center;">${i+1}</td>
                <td width="10" style="vertical-align: middle;text-align: center;">
                  <a href="javascript:void(0)" onclick=${() => this.delete(bookmark.id)} title=${'delete ' + bookmark.title} class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                      <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                    </svg>
                  </a>
                </td>
                <td>
                  <div>
                    <a href="${bookmark.url}"><span class="bookmark-title">${bookmark.title}</span></a>
                  </div>
                </td>
              </tr>
              `
            )}
          </tbody>
          <tfoot class="recessed-reversed">
            <tr>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>`
  },
  delete(id) {
    this.dispatchEvent(new CustomEvent('onDelete', { detail: { id } }));
  }
});