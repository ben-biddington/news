const render = (document, application) => {
    clear(document);

    const builder = new DomBuilder(document);

    const applicationDiv = builder.div('application'); 
    document.body.appendChild(applicationDiv);

    renderLobsters  (document, application, applicationDiv);
    renderHackerNews(document, application, applicationDiv);
    renderRnzNews   (document, application, applicationDiv);
    renderBookmarks (document, application, applicationDiv);
}

const clear = document => {
    const application = document.querySelector('#application');

    if (application) {
        document.body.removeChild(application);
    }
}

const renderLobsters = async (document, application, container) => {

    const lobstersNode = createNewsNode(document, 'lobsters');

    container.appendChild(lobstersNode);

    await fill(document, application, lobstersNode, application.lobsters.list(), 'lobsters');

    application.on('lobsters-item-deleted', e => {
        const list = document.querySelector(`div#lobsters .items`);

        const elementId = `news-${e.id}`;

        const selector = `div#lobsters li#${elementId}`;

        const listItem = document.querySelector(selector);
        
        try {
            list.removeChild(listItem);

            console.log(`Item deleted <${e.id}>`);
        } catch (error) {
            console.error(
                `Failed to delete <${e.id}> with selector <${selector}>` + 
                `The error is: ${error}`);
        }
    });

    application.on('lobsters-items-loaded', async e => {
        const list = document.querySelector(`div#lobsters .items`);

        try {
            list.innerHtml = '';
            
            await fill(document, application, lobstersNode, e.items, 'lobsters');
        } catch (e) {
            console.error(e);
        }
    });
}

const renderHackerNews = async (document, application, container) => {

    const hackerNewsNode = createNewsNode(document, 'hackerNews');

    container.appendChild(hackerNewsNode);

    await fill(document, application, hackerNewsNode, application.hackerNews.list(), 'hackerNews');

    application.on('hacker-news-item-deleted', e => {
        const list = document.querySelector(`div#hackerNews .items`);

        const elementId = `news-${e.id}`;

        const selector = `div#hackerNews li#${elementId}`;

        const listItem = document.querySelector(selector);
        
        try {
            list.removeChild(listItem);

            console.log(`Item deleted <${e.id}>`);
        } catch (error) {
            console.error(
                `Failed to delete <${e.id}> with selector <${selector}>` + 
                `The error is: ${error}`);
        }
    });
}

const renderRnzNews = async (document, application, container) => {

    const rnzNode = createNewsNode(document, 'rnzNews');

    container.appendChild(rnzNode);

    await fill(document, application, rnzNode, application.rnzNews.list(), 'rnzNews', { showHost: false, showBookmarkLink: false });

    application.on('rnz-news-item-deleted', e => {
        const list = document.querySelector(`div#rnzNews .items`);

        const elementId = `news-${e.id}`;

        const selector = `div#rnzNews li#${elementId}`;

        const listItem = document.querySelector(selector);
        
        try {
            list.removeChild(listItem);

            console.log(`Item deleted <${e.id}>`);
        } catch (error) {
            console.error(
                `Failed to delete <${e.id}> with selector <${selector}>` + 
                `The error is: ${error}`);
        }
    });
}

const createNewsNode = (document, topLevelId) => {
    
    const builder = new DomBuilder(document);

    const container = builder.div(topLevelId);
    
    const title = builder.element('div');
    title.setAttribute('class', 'title');
    title.appendChild(document.createTextNode(topLevelId));

    container.appendChild(title);

    const itemsList = builder.element('ol');
    itemsList.setAttribute('class', 'items'); 
    container.appendChild(itemsList);

    return container;
}

const fill = async (document, application, container, listTask, topLevelId, opts) => {
    const builder = new DomBuilder(document);

    const list = await listTask;

    const options = { showHost: true, showBookmarkLink: true, ...opts };

    const itemsList = container.querySelector('.items');

    for (let i = 0; i < list.length; i++) {
        const newsItem = list[i];
        const elementId = `news-${newsItem.id}`;
        const listItem = builder.element('li', elementId);
        const isDeleted = newsItem.deleted === true;

        if (isDeleted) {
            listItem.setAttribute('class', 'item deleted');
        } else {
            listItem.setAttribute('class', 'item');
        }

        const link = builder.element('a');
        link.setAttribute('href', newsItem.url);
        link.setAttribute('class', 'title');
        link.appendChild(document.createTextNode(newsItem.title));
        listItem.appendChild(link);

        const ageLabel = builder.element('span');
        ageLabel.setAttribute('class', 'age');
        ageLabel.appendChild(document.createTextNode(newsItem.ageSince(application.now())));
        listItem.appendChild(ageLabel);

        if (options.showHost) {
            const hostLabel = builder.element('span');
            hostLabel.setAttribute('class', 'host');
            hostLabel.appendChild(document.createTextNode(newsItem.host));
            listItem.appendChild(hostLabel);
        }

        if (options.showBookmarkLink) {
            const bookmarkButton = builder.element('a');
            bookmarkButton.setAttribute('href', `javascript:application.bookmarks.add('${newsItem.id}')`);
            bookmarkButton.setAttribute('class', 'bookmark');
            //bookmarkButton.setAttribute('title', `Delete item with id '${newsItem.id}'`);
            bookmarkButton.appendChild(document.createTextNode('bookmark'));
            listItem.appendChild(bookmarkButton);
        }

        if (false == isDeleted) {
            const deleteButton = builder.element('a');
            deleteButton.setAttribute('href', `javascript:application.${topLevelId}.delete('${newsItem.id}')`);
            deleteButton.setAttribute('class', 'del');
            deleteButton.setAttribute('title', `Delete item with id '${newsItem.id}'`);
            deleteButton.appendChild(document.createTextNode('delete'));
            listItem.appendChild(deleteButton);
        }

        itemsList.appendChild(listItem);
    }
}

const renderBookmarks = async (document, application, container) => {

    const builder = new DomBuilder(document);
    
    const bookmarksElement = builder.div('bookmarks');
    
    const title = builder.element('div');
    title.setAttribute('class', 'title');
    title.appendChild(document.createTextNode('Bookmarks'));

    bookmarksElement.appendChild(title);

    const itemsList = builder.element('ol');
    itemsList.setAttribute('class', 'items'); 
    bookmarksElement.appendChild(itemsList);

    container.appendChild(bookmarksElement);

    const bookmarks = await application.bookmarks.list();

    bookmarks.forEach(bookmark => {
        itemsList.appendChild(newBookmarkListItem(bookmark));
    });

    application.on('bookmark-added', bookmark => {
        const list = document.querySelector(`div#bookmarks .items`);

        try {
            list.appendChild(newBookmarkListItem(bookmark));
        } catch (error) {
            console.error(`Failed to add bookmark <${e}>. The error is: ${error}`);
        }
    });

    application.on('bookmark-deleted', e => {
        const list = document.querySelector(`div#bookmarks .items`);

        const elementId = `bookmark-${e.id}`;

        const selector = `div#bookmarks li#${elementId}`;

        const listItem = document.querySelector(selector);
        
        try {
            list.removeChild(listItem);

            console.log(`Item deleted <${e.id}>`);
        } catch (error) {
            console.error(
                `Failed to delete <${e.id}> with selector <${selector}>` + 
                `The error is: ${error}`);
        }
    });
}

const newBookmarkListItem = bookmark => {
    const builder = new DomBuilder(document);

    const listItem = builder.element('li', `bookmark-${bookmark.id}`);
    listItem.setAttribute('class', 'items');

    const link = builder.element('a');
    link.setAttribute('href', bookmark.url);
    link.setAttribute('class', 'title');
    link.appendChild(document.createTextNode(bookmark.title));
    listItem.appendChild(link);

    const deleteButton = builder.element('a');
    deleteButton.setAttribute('href', `javascript:application.bookmarks.del('${bookmark.id}')`);
    deleteButton.setAttribute('class', 'del');
    deleteButton.setAttribute('title', `Delete item with id '${bookmark.id}'`);
    deleteButton.appendChild(document.createTextNode('delete'));
    listItem.appendChild(deleteButton);

    return listItem;
}

class DomBuilder {
    constructor(document) {
        this._document = document;
    }

    div(id) {
        return this.element('div', id);
    }

    element(tagName, id) {
        const result = document.createElement(tagName);
        
        if(id) {
            result.setAttribute('id', id);
        }
        return result;
    }
}

module.exports.render = render;