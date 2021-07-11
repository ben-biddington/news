import { DiaryApplication } from "../../../../../core/diary/diary-application";
import { createSignal, For, Show, onMount } from 'solid-js';
import { DiaryEntry, Session } from "../../../../../core/diary/diary-entry";
import { formatNewZealandDate } from "../../../../../core/date";
import stringify from "../../../../../core/stringify";
import { Edit } from './components/diary/edit';
import { formatDuration, intervalToDuration } from 'date-fns';

export type Props = {
  application: DiaryApplication
}

export const DiaryApplicationView = (props: Props) => {
  const [diaryEntries, setDiaryEntries]         = createSignal<DiaryEntry[]>([]);
  const [currentlyEditing, setCurrentlyEditing] = createSignal<DiaryEntry>(undefined);
  const [creatingNew, setCreatingNew]           = createSignal<boolean>(false);
  
  props.application.subscribe((state) => {
    setDiaryEntries(state.entries);
  });

  const reload    = props.application.list;
  const _delete   = props.application.delete;
  const createNew = () => { 
    setCreatingNew(true);
    setCurrentlyEditing(undefined);
  }

  onMount(() => props.application.list());

  const save = async (diaryEntry: DiaryEntry) => {
    edit(await props.application.save(diaryEntry));
  }

  const edit = (diaryEntry: DiaryEntry) => setCurrentlyEditing(diaryEntry);
  const cancel = () => { setCurrentlyEditing(undefined); setCreatingNew(false); }

  const lines = (t: string) => t?.split(/\r\n|\r|\n/) || [ ];

  const sessionDuration = (session: Session) => {
    return formatDuration(intervalToDuration({
      start: new Date(session.start),
      end: new Date(session.end)
    })); 
  }

  return <>
    <div id="diary" class="shadow container w-75">
      <table class="table">
        <thead>
          <tr>
            <td colspan="3">
              <strong>Diary</strong> ({diaryEntries().length})
              <span class="ml-2">
                <a href="javascript:void(0)" onclick={() => createNew()}>new</a>
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          <Show when={creatingNew() || currentlyEditing() != undefined} children={
            <>
              <tr>
                <td colspan={3}>
                  <Edit onSave={save} onCancel={cancel} entry={currentlyEditing()} />
                </td>
              </tr>
            </>
          } />
          <For each={diaryEntries()} children={(item: DiaryEntry, i) => 
            <>
            <tr>
              <td width="100" style="vertical-align: middle;text-align: center;">
                {formatNewZealandDate(item.session?.start)}
              </td>
              <td style="vertical-align: middle;text-align: center;">
                <a href="javascript:void(0)" onclick={() => _delete(item.id)} class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                  </svg>
                </a>
                <button onclick={() => edit(item)}>edit</button>
              </td>
              <td>
                <div style="margin-bottom:10px">
                  <p>{lines(item.body)[0]}</p>
                  {sessionDuration(item.session)}
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