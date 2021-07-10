import { IDiaryApplication, DiaryApplication } from '../../core/diary/diary-application';
import { DiaryPorts, DiaryPortsBuilder } from '../../core/diary/diary-ports';
import { Internet } from '../../core/ports/internet';

export const create = (internet: Internet): IDiaryApplication => {
  const _ports = ports(internet);

  console.log(_ports);

  return new DiaryApplication(_ports);
};

const ports = (internet: Internet) => {
  return DiaryPortsBuilder.devNull()
    .withList(() => {
      return internet.get('/diary', {}).
        then(reply => {
          return JSON.parse(reply.body);
        })
    })
    .withDelete(async (id: string) => {
      await internet.delete(`/diary/${id}`, {});
    }).build();
}