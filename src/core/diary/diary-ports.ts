import { DiaryEntry } from "./diary-entry";

export class DiaryPortsBuilder {
  private ports: DiaryPorts;

  constructor(ports: DiaryPorts) {
    this.ports = ports;
  }

  static new(): DiaryPortsBuilder {
    return new DiaryPortsBuilder(null);
  }

  static devNull(): DiaryPortsBuilder {
    return new DiaryPortsBuilder(devNull());
  }

  public withList(list: () => Promise<DiaryEntry[]>): DiaryPortsBuilder {
    return new DiaryPortsBuilder({ ...this.ports, list });
  }

  public withDelete(_delete: (id: string) => Promise<void>): DiaryPortsBuilder {
    return new DiaryPortsBuilder({ ...this.ports, delete: _delete });
  }
  
  public build(): DiaryPorts {
    return this.ports;
  }
}

export const devNull = () => ({
  add:    (entry: DiaryEntry)   => Promise.resolve(),
  get:    (id: string)          => Promise.resolve(null),
  delete: (id: string)          => Promise.resolve(),
  list:   ()                    =>  Promise.resolve([]),
})

export type DiaryPorts = {
  add(entry: DiaryEntry): Promise<void>;
  get(id: string): Promise<DiaryEntry | null>;
  delete(id: string): Promise<void>;
  list(): Promise<DiaryEntry[]>;
}