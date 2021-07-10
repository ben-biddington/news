import { DiaryPorts, DiaryPortsBuilder } from "./diary-ports";
import { DiaryState } from "./diary-state";
import { Store } from "./internal/store";

export interface IDiaryApplication {
  list(): Promise<void>;
  delete(id: string): Promise<void>;
  subscribe(listener: (state: DiaryState) => void): void;
}

export class DiaryApplication implements IDiaryApplication {
  private ports: DiaryPorts;
  private store: Store;

  constructor(portsOrBuilder: DiaryPorts | DiaryPortsBuilder) {
    let ports: DiaryPorts;
    
    if ((portsOrBuilder as DiaryPortsBuilder).build) {
      ports = (portsOrBuilder as DiaryPortsBuilder).build();;
    } else {
      ports = portsOrBuilder as DiaryPorts;
    }

    this.ports = ports;
    this.store = new Store();
  }

  subscribe(listener: (state: DiaryState) => void) {
    this.store.subscribe(listener);
  }

  public delete = async (id: string) => {
    return this.ports.delete(id).then(this.list);
  }

  public list = async () => {
    this.store.set({ entries: await this.ports.list() });
  }
}