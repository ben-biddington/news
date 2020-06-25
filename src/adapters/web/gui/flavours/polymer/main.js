// https://lit-html.polymer-project.org/guide/writing-templates
const { html, render: r } = require('lit-html');
const { LitElement } = require('lit-element');

// https://lit-element.polymer-project.org/try/properties
class BookmarksPanel extends LitElement {
    static get properties() {
        return { bookmarks: { type: Array, reflect: true  } };
    }

    constructor() {
        super();
        this.bookmarks = [ {title:'a'} ];
    }

    updated(changedProperties) {
        console.log(changedProperties); 
        console.log(this.bookmarks);
    }
     
    render() {
        return html`
        <div id="application">
            <div id="news">
                <div id="bookmarks">
                    <div class="title">Bookmarks (${this.bookmarks.length})</div>
                    <ol class="items">
                    ${this.bookmarks.map((bookmark) => html`
                        <li class="item" id="bookmark-${bookmark.id}">
                            <a href=${bookmark.url} class="title">${bookmark.title}</a>
                            <a
                                href="javascript:application.bookmarks.del('${bookmark.id}')"
                                class="del"
                                title="Delete item with id '${bookmark.id}'">
                                delete
                            </a>
                        </li>
                        `)}
                    </ol>
                </div>
            </div>
        </div>
        `
    }
}

const sayHello = bookmarks => {

    return html`
    <div id="application">
        <div id="news">
            <div id="bookmarks">
                <div class="title">Bookmarks (${bookmarks.length})</div>
                <ol class="items">
                ${bookmarks.map((bookmark) => html`
                    <li class="item" id="bookmark-${bookmark.id}">
                        <a href=${bookmark.url} class="title">${bookmark.title}</a>
                        <a
                            href="javascript:application.bookmarks.del('${bookmark.id}')"
                            class="del"
                            title="Delete item with id '${bookmark.id}'">
                            delete
                        </a>
                    </li>
                    `)}
                </ol>
            </div>
        </div>
    </div>
`};

let bookmarks = [];

const render = async (document, application) => {
    application.on("bookmark-added"     , bookmark  => bookmarks = [...bookmarks, bookmark ]);
    application.on("bookmark-deleted"   , e         => bookmarks  = bookmarks.filter(it => it.id != e.id));

    bookmarks = await application.bookmarks.list();

    r(sayHello(bookmarks), document.body);

    // The following does work but renders in custom element
    //r(html`<bookmarks-panel bookmarks="${JSON.stringify(bookmarks)}"/>`, document.body);
}

customElements.define('bookmarks-panel', BookmarksPanel);
module.exports = { render };