export abstract class BlockedHosts {
  abstract add(host: string): Promise<void>;
  abstract remove(host: string): Promise<void>;
  abstract has(host: string): Promise<boolean>;
}