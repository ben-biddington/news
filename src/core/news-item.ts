import { Cloneable } from './cloneable';

export class NewsItem extends Cloneable {
  id: string = '';
  title: string = '';
  url: string = '';
  date: Date = null;
  deleted: boolean = false;
  new: boolean = false;
  hostIsBlocked: boolean = false;
  label: string = '';

  static blank(): NewsItem {
    return new NewsItem('', '', '', new Date());
  }

  static keys() {
    return Object.keys(new NewsItem());
  }

  constructor(id?: string, title?: string, url?: string, date?: Date) {
    super();

    this.id = id;
    this.title = title;
    this.url = url;
    this.date = date;
    this.deleted = false;
    this.new = false
  }

  get host() { return require('url').parse(this.url || '').hostname || ''; }

  withUrl(url) {
    return this.clone(it => it.url = url);
  }

  withBlockedHost(blocked: boolean) : NewsItem {
    return this.clone(it => it.hostIsBlocked = blocked);
  }

  dated(date) {
    return this.clone(it => it.date = date);
  }

  ageSince(when) {
    const moment = require('moment');

    const difference = moment.duration(moment(when).diff(moment(this.date)));

    return difference.humanize();
  }

  thatIsDeleted() {
    const result = new NewsItem(this.id, this.title, this.url, this.date);

    result.deleted = true;

    return result;
  }

  thatIsNew() {
    return this.clone(it => it.new = true);
  }

  labelled(label: string) {
    return this.clone(it => it.label = label);
  }
}