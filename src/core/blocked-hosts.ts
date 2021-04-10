export abstract class BlockedHosts {
  abstract add(host:String): Promise<void>;
  abstract has(host:String): Promise<boolean>;
}