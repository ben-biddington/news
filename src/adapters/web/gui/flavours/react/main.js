import "@babel/polyfill";
import React from "react";
import ReactDOM from 'react-dom';
import NewsPanel from './NewsPanel';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarks: [],
      lobsters: []
    };
  }

  async componentDidMount() {
    const bookmarks = await this.props.application.bookmarks.list();
    const lobsters  = await this.props.application.lobsters.list();
    
    application.on(
      "bookmark-deleted", 
      e => this.setState({ bookmarks: this.state.bookmarks.filter(it => it.id != e.id) }));

    application.on(
      "bookmark-added", 
      bookmark => this.setState({ bookmarks: [bookmark, ...this.state.bookmarks] }));

    this.setState({ bookmarks, lobsters });
  }

  render() {
    return (
      <>
      <div id="navigation">
        <ul className="items">
          <li className="logo"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React icon" width="20" height="20" /></li>
        </ul>
      </div>
      <div id="news">
        <NewsPanel id="lobsters" useCase="lobsters" title="Lobsters" allowSnooze={true} 
            application={this.props.application} 
            loadEvents={[ 'lobsters-items-loaded' ]} 
            filterEvents={[ 'lobsters-item-deleted', 'lobsters-item-snoozed' ]}/>
        <NewsPanel id="hackerNews" useCase="hackerNews" title="Hacker News" allowSnooze={false} 
            application={this.props.application} 
            loadEvents={[ 'hacker-news-items-loaded' ]} 
            filterEvents={[ 'hacker-news-item-deleted' ]} />
        <div id="bookmarks">
          <div className="title">Bookmarks ({this.state.bookmarks.length})</div>
          <ol className="items">
            {this.state.bookmarks.map(bookmark => 
              <li className="item" id={`bookmark-${bookmark.id}`} key={bookmark.id}>
                <a href={bookmark.url} className="title">{bookmark.title}</a>
                <a
                  href="#"
                  onClick={() => this.props.application.bookmarks.del(`${bookmark.id}`)}
                  className="del"
                  title={`Delete item with id '${bookmark.id}'`}>
                  delete
                </a>
              </li>
            )}
          </ol>
        </div>
      </div>
      </>
    );
  }
}

ReactDOM.render(<App application={window.application} />, document.querySelector('#application'));