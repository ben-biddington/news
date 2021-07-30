const expect = require('chai').expect;
import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { DiaryPorts, DiaryPortsBuilder } from '../../../src/core/diary/diary-ports';
import { DiaryState } from '../../../src/core/diary/diary-state';
import { DiaryApplication, IDiaryApplication } from '../../../src/core/diary/diary-application'
import { Attachment } from '@test/../src/core/diary/attachment';

describe('The diary application', async () => {
  it('listing publishes whatever the list port returns', async () => {
    const entry: DiaryEntry = { id: 'abc', timestamp: new Date(), body: 'A B C' };

    const application = new DiaryApplication(DiaryPortsBuilder.devNull().withList(() => Promise.resolve([ entry ])));
  
    const listener = new MockListener(application);  

    await application.list();

    listener.mustHave(entry);
  });
});

describe('The diary application and deleting', async () => {
  it('for example', async () => {
    const ports = new MockDiaryPorts();

    const application = new DiaryApplication(ports);
  
    await application.delete('xxx');

    ports.mustHaveBeenAskedToDelete('xxx');
  });
});

describe('The diary application and adding/saving', async () => {
  it('adds when id is undefined', async () => {
    const ports = new MockDiaryPorts();

    const application = new DiaryApplication(ports);
  
    await application.save({ body: 'A new entry' })

    ports.mustHaveBeenAskedToAdd();
  });

  it('saves when id is present', async () => {
    const ports = new MockDiaryPorts();

    const application = new DiaryApplication(ports);
  
    await application.save({ id: 'id-1', body: 'A new entry' })

    ports.mustNotHaveBeenAskedToAdd();
    ports.mustHaveBeenAskedToSave('id-1');
  });
});

describe('Building ports', async () => {
  it('for example', async () => {
    const expected = () => Promise.resolve();

    const ports = DiaryPortsBuilder.devNull().
      withList(() => Promise.resolve([])).
      withDelete(expected);

    expect(ports.build().delete).to.eql(expected);
  });
});

class MockDiaryPorts implements DiaryPorts {
  private deletes: string[] = [];
  private adds: DiaryEntry[] = [];
  private saves: DiaryEntry[] = [];

  add(entry: DiaryEntry): Promise<DiaryEntry> {
    this.adds.push(entry);
    return Promise.resolve(entry);
  }
  save(entry: DiaryEntry): Promise<DiaryEntry> {
    this.saves.push(entry);
    return Promise.resolve(entry);
  }
  attach(attachment: Attachment): Promise<void> {
    throw new Error('Method not implemented.');
  }
  get(id: string): Promise<DiaryEntry> {
    return Promise.resolve(null);
  }
  delete(id: string): Promise<void> {
    this.deletes.push(id);
    return Promise.resolve();
  }
  list(): Promise<DiaryEntry[]> {
    return Promise.resolve([]);
  }

  mustHaveBeenAskedToDelete(id: string) {
    expect(this.deletes).to.contain(id);
  }

  mustNotHaveBeenAskedToAdd() {
    expect(this.adds.length).to.eql(0);
  }

  mustHaveBeenAskedToAdd() {
    expect(this.adds.length).to.be.greaterThan(0);
  }

  mustHaveBeenAskedToSave(id: string) {
    expect(this.saves.map(it => it.id)).to.contain(id);
  }
}

class MockListener {
  private history: DiaryState[] = [];

  constructor(application: IDiaryApplication) {
    application.subscribe(state => this.history.push(state));
  }

  mustHave(expected: DiaryEntry) {
    const ok = this.history.some(it => it.entries.includes(expected));

    expect(this.history[this.history.length - 1].entries).to.include(expected);

    expect(ok).to.be.true;
  }
}