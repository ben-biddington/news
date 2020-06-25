import "@babel/polyfill";
import React from "react";
import { Transition, CSSTransition } from 'react-transition-group';

class NewsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        source: [],
    };
  }

  async componentDidMount() {
    this.props.application.on(this.props.loadEvents, 
        e => this.setState({ 
            source: e.items }));

    this.props.application.on(this.props.filterEvents, 
        e => this.setState({ 
            source: this.state.source.filter(it => it.id != e.id) }));

    this.setState({ 
            source: await this.props.application[this.props.useCase].list() });
  }

  trim (text, count) {
    return `${text.substring(0, count)}${text.length > count ? '...' : ''}`;
  }

  render() {

    const defaultProps = {
        showAge:        true,
        showHost:       true,
        allowBookmark:  true,
        allowSnooze:    false,
        filterEvents: [],
        loadEvents: []
    }

    const props = {...defaultProps, ...this.props };

    return (
      <div id={props.id} className="bs-component">
        <div className="title">{props.title} <span class='lastUpdated'></span></div>
        <ol className="items list-group">
            {this.state.source.map((newsItem, i) => 
              <li className={`item list-group-item ${newsItem.deleted ? 'deleted': ''}`} id={`news-${newsItem.id}`} key={newsItem.id}>
                  <div className="item-body">
                    <div className="lead">
                      <a href={newsItem.url} className="title" title={newsItem.title}>{this.trim(newsItem.title)}</a>
                      <CSSTransition
                        in={true}
                        timeout={{ appear: 500*i }}
                        classNames='fade'
                        appear
                        >
                            <div className="meta">
                            {props.showAge &&
                                <span className="age">{newsItem.ageSince(props.application.now())}</span>
                            }
                            {props.showHost &&
                                <span className="host">{newsItem.host}</span>
                            }
                            </div>
                        </CSSTransition>
                    </div>
                  
                  <div className="controls">
                    {props.allowBookmark &&
                        <a
                            href="#"
                            onClick={() => application.bookmarks.add(`${newsItem.id}`)}
                            className="bookmark btn btn-success">
                            bookmark
                        </a> 
                    }
                    
                    {props.allowSnooze &&
                        <a
                            href="#"
                            onClick={() => application[props.useCase].snooze(`${newsItem.id}`)}
                            className="snooze btn btn-warning"
                            title={`Snooze item with id '${newsItem.id}'`}>
                            snooze
                        </a> 
                    }

                    {!newsItem.deleted &&
                        <a
                            href="#"
                            onClick={() => application[props.useCase].delete(`${newsItem.id}`)}
                            className="del btn btn-danger"
                            title={`Delete item with id '${newsItem.id}'`}>
                            delete
                        </a>
                    }
                  </div>
                </div>
              </li>
            )}
        </ol>
    </div>
    );
  }
}

export default NewsPanel;