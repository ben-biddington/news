import { DiaryEntry } from "./diary-entry";
import { DiaryPorts, DiaryPortsBuilder } from "./diary-ports";
import { DiaryState } from "./diary-state";
import { Store } from "./internal/store";
import stringify from "../stringify";
import { Attachment } from "./attachment";

export interface IDiaryApplication {
  list()                                          : Promise<void>;
  save(diaryEntry: DiaryEntry)                    : Promise<DiaryEntry>;
  attach(attachment: Attachment)                  : Promise<void>;
  delete(id: string)                              : Promise<void>;
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

  public save = async (diaryEntry: DiaryEntry) : Promise<DiaryEntry> => {
    console.log(`Saving changes`, stringify(diaryEntry));

    const result = await diaryEntry.id 
      ? this.ports.save(diaryEntry) 
      : this.ports.add(diaryEntry);

    this.store.set({ entries: await this.ports.list() });

    console.log(`Returning`, stringify(result));

    return result;
  }

  public attach = async (attachment: Attachment) => {
    this.ports.attach(attachment);
  }
}