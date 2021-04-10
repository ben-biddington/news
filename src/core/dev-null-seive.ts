export class DevNullSeive {
  apply(newsItems: any): Promise<any>{
    return Promise.resolve(newsItems.map(it => it.id));
  }
}