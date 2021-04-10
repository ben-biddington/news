import { BlockedHosts } from "./blocked-hosts";

export class DevNullBlockedHosts extends BlockedHosts {
  remove(host: string): Promise<void> {
    return Promise.resolve();
  }
  add(host: String): Promise<void> {
    return Promise.resolve();
  }
  has(host: String): Promise<boolean> {
    return Promise.resolve(false);
  }
}