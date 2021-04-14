import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'

createComponent('ficus-toolbar', {
  renderer,
  props: {
    deletedCount: {
      type: Number,
      default: 0,
      required: false,
      observed: true 
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      required: false,
      observed: true 
    }
  },
  render() {
    return html`
      <div class="toolbar row" style="text-align: right">
        <div class="col-12">
          <ul class="list-group list-group-horizontal">
            <li class="list-group-item">
              <div style="float:right; display: inline-block;">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
                </svg><span>${this.props.deletedCount}</span>
              </div>
            </li>
            <li class="list-group-item">
              <div style="float:right; display: inline-block;">
                <a href="javascript:void(0)" onclick=${this.toggleBookmarks}>
                <svg width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                </svg></a><span>${this.props.bookmarkCount}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    `
  },
  toggleBookmarks() {
    this.dispatchEvent(new CustomEvent('toggleBookmarks', {}));
  }
});