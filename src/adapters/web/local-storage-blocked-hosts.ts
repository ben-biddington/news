import { BlockedHosts } from '../../core/blocked-hosts';

export class LocalStorageBlockedHosts extends BlockedHosts {
  private storage: any;
  private key: string = "blocked-hosts";

  constructor(window: any) {
    super();
    
    this.storage = window.localStorage;

    if (!this.storage.getItem(this.key)) {
      this.set([]);
    }
  }

  async add(host: string): Promise<void> {
    if (await this.has(host))
      return;

    const current = this.get();
    
    current.push(host);

    this.set(current);
  }

  has(host: string): Promise<boolean> { return Promise.resolve(this.get().includes(host)); }

  private set(value: string[]) {
    this.storage.setItem(this.key, JSON.stringify(value));
  }

  private get() : string[] { 
    const item = JSON.parse(this.storage.getItem(this.key));
    
    return item as string[]; 
  }
}