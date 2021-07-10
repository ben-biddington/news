import { DiaryApplication } from "../../../../../core/diary/diary-application";
import { createSignal, For, Show, onMount } from 'solid-js';
import { DiaryEntry } from "../../../../../core/diary/diary-entry";
import { toNewZealandTime } from "../../../../../core/date";
import { format } from 'date-fns'
import { enNZ } from 'date-fns/locale'
import { Edit } from './components/diary/edit';

export type Props = {
  application: DiaryApplication
}

export const DiaryApplicationView = (props: Props) => {
  const [diaryEntries, setDiaryEntries] = createSignal<DiaryEntry[]>([]);
  const [editing, setEditing] = createSignal<string>(null);
  const [creatingNew, setCreatingNew] = createSignal<boolean>(false);
  
  props.application.subscribe((state) => {
    setDiaryEntries(state.entries);
  });

  const reload    = props.application.list;
  const _delete   = props.application.delete;
  const edit      = (id: string) => setEditing(id);
  const createNew = () => setCreatingNew(true);

  onMount(() => props.application.list());

  return <>
    <div id="news" class="shadow">
      <table class="table">
        <thead>
          <tr>
            <td colspan="3">
              <strong>Diary</strong> ({diaryEntries().length})
              <span class="ml-2">
                <a href="javascript:void(0)" onClick={reload} class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                    <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                    <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
                  </svg>
                </a>
                <a href="javascript:void(0)" onclick={() => createNew()}>new</a>
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          <Show when={creatingNew()}  children={
            <>
              <tr>
                <td colspan={3}>
                  <Edit />
                </td>
              </tr>
            </>
          } />
          <For each={diaryEntries()} children={(item, i) => 
            <>
            <tr>
              <td width="20" style="vertical-align: middle;text-align: center;">{i()+1}</td>
              <td width="100" style="vertical-align: middle;text-align: center;">
                <a href="javascript:void(0)" onclick={() => _delete(item.id)} class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                  </svg>
                </a>
                {format(toNewZealandTime(item.timestamp), 'PPPP', { locale: enNZ })} 
                <button onclick={() => edit(item.id)}>edit</button>
              </td>
              <td>
                <div style="margin-bottom:10px">
                  {item.body}
                </div>
              </td>
            </tr>
            </>
          } />
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">&nbsp;</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </>
}