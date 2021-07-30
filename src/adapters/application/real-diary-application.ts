import { Attachment } from '../../core/diary/attachment';
import { IDiaryApplication, DiaryApplication } from '../../core/diary/diary-application';
import { DiaryEntry } from '../../core/diary/diary-entry';
import { DiaryPortsBuilder } from '../../core/diary/diary-ports';
import { Internet } from '../../core/ports/internet';

export const create = (internet: Internet): IDiaryApplication => new DiaryApplication(ports(internet));

const ports = (internet: Internet) => {
  return DiaryPortsBuilder.devNull()
    .withAdd(async (entry: DiaryEntry) => 
      internet.post('/diary', headers(), entry).then(reply => JSON.parse(reply.body))
    )
    .withSave(async (entry: DiaryEntry) => 
      internet.put(`/diary/${entry.id}`, headers(), entry).then(reply => JSON.parse(reply.body))
    )
    .withAttach(async (attachment: Attachment) => {
      // internet.post(`/diary/${entry.id}`, headers(), entry).then(reply => JSON.parse(reply.body))
      console.log(`[diary-api] @todo: attach file requires binary post, attachment: <${attachment}>`);
      return Promise.resolve();
    })
    .withList(() => 
      internet.get('/diary', {}).then(reply => JSON.parse(reply.body))
    )
    .withDelete((id: string) => internet.delete(`/diary/${id}`, {}))
    .build();
}

const headers = () => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});