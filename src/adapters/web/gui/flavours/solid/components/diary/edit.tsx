import { createEffect, createMemo, createSignal } from "solid-js"
import { mergeProps, Show } from "solid-js/web"
import { DiaryEntry, Session } from "../../../../../../../core/diary/diary-entry"
import { formatNewZealandTimeOfDay, toNewZealandTime } from "../../../../../../../core/date";
import { format, set, parse } from 'date-fns'
import { enNZ } from 'date-fns/locale'
import stringify from '../../../../../../../core/stringify';
import { Image } from '../../components/Image';
import { Attachment } from "../../../../../../../core/diary/attachment";

export type Props = {
  entry?: DiaryEntry,
  onSave?: (diaryEntry: DiaryEntry) => void;
  onAttach?: (attachment: Attachment) => void;
  onCancel?: () => void;
}

type SessionTimes = {
  start: string;
  end: string;
}

const blank = (): DiaryEntry => ({ 
  body: undefined,
  timestamp: new Date(),
});

const defaultSessionTimes: SessionTimes = {
  start:  '9.00',
  end:    '11.00'
};

type Time = {
  hours: number;
  minutes: number;
}

const parseTime = (text: string): Time => {
  return {
    hours: parseInt(text.split(':')[0]),
    minutes: parseInt(text.split(':')[1])
  }
}

export const Edit = (props: Props) => {
  props = mergeProps({
      onSave: () => {}, 
      onCancel: () => {}, 
      entry: blank(),
    }, 
    props);
  
  const dateTimeText  = (date: Date) => format(toNewZealandTime(date), 'PPPppp' , { locale: enNZ });
  const dayText       = (date: Date) => format(toNewZealandTime(date), 'PPP'   , { locale: enNZ });
  const timeText      = (date: Date) => format(toNewZealandTime(date), 'p'      , { locale: enNZ });

  const toSessionTimes = (session: Session): SessionTimes => {
    return {
      start: session?.start  ? formatNewZealandTimeOfDay(session.start)  : defaultSessionTimes.start,
      end: session?.end      ? formatNewZealandTimeOfDay(session.end)    : defaultSessionTimes.end,
    }
  }

  const [dateHint, setDateHint]               = createSignal<string>(dayText(props.entry?.session?.start || new Date()));
  const [sessionDate, setSessionDate]         = createSignal<Date>(props.entry?.session?.start || new Date());
  const [sessionDayText, setSessionDayText]   = createSignal<string>(dayText(sessionDate()));
  const [sessionTimes, setSessionTimes]       = createSignal<SessionTimes>(toSessionTimes(props.entry?.session));
  const [session, setSession]                 = createSignal<Session>(props.entry.session);
  const [body, setBody]                       = createSignal<string>(props.entry.body);
  const [board, setBoard]                     = createSignal<string>(props.entry.board);
  const [location, setLocation]               = createSignal<string>(props.entry.location);
  const [tide, setTide]                       = createSignal<string>(props.entry.tide);
  const [showScreenshots, setShowScreenshots] = createSignal<boolean>(false);

  const id = (name: string) => `${props.entry.id}-${name}`;

  const save = () => {
    props.onSave({ 
      id: props.entry.id, 
      body: body(), 
      session: session(),
      board: board(),
      location: location(),
      tide: tide(), 
      images: showScreenshots() 
        ? [ 
            `/marine-weather/wellington/${format(sessionDate(), 'yyyy-MM-dd')}`, 
            `/marine-weather/titahi-bay/${format(sessionDate(), 'yyyy-MM-dd')}` 
          ]
        : []
    });
  }

  const onDateChange = (event) => {
    setSessionDayText(event.target.value);
    calculateSession();
  }

  const onStartTimeChanged = (e) => {
    setSessionTimes(v => ({...v, start: e.target.value}));
    calculateSession();
  }

  const onEndTimeChanged = (e) => {
    setSessionTimes(v => ({...v, end: e.target.value}));
    calculateSession();
  }

  const calculateSession = () => {
    try {
      const sessionDay  = new Date(sessionDayText());
      
      const startTime   = parseTime(sessionTimes().start);
      const endTime     = parseTime(sessionTimes().end);

      const startDateAndTime  = set(sessionDay, { hours: startTime.hours, minutes: startTime.minutes });
      const endDateAndTime    = set(sessionDay, { hours: endTime.hours, minutes: endTime.minutes });

      console.log('start', stringify(startTime), 'end', stringify(endTime));
      console.log('sessionDate', sessionDate(), 'sessionDay', sessionDayText(), 'startDateAndTime', startDateAndTime);

      setDateHint(`${dayText(startDateAndTime)} ${timeText(startDateAndTime)} - ${timeText(endDateAndTime)}`);
      setSession({ start: startDateAndTime, end: endDateAndTime }); 
    }
    catch (e) { 
      // console.log(e)
    }
  }

  const dateLabel = createMemo(() => {
    if (!session())
      return;

    return `${dayText(session().start)} ${timeText(session().start)} - ${timeText(session().end)}`;
  });

  createEffect(() => {
    console.log(stringify(props.entry));
  })

  const onPaste = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(e.clipboardData.items);
    console.log(e.clipboardData.items[0]);

    props.onAttach({ diaryEntryId: parseInt(props.entry.id), file: e.clipboardData.items[0].getAsFile() })
  }

  return <>
    <form>
      <div class="form-group" onPaste={onPaste}>
        <div class="row">
          <div class="col-2">
            <input title="Date"
              onchange={onDateChange}
              type="text" class="form-control" id={id('date')} placeholder="Date" 
              value={dayText(sessionDate())} />
          </div>
          <div class="col-2"> 
            <input title="Start time"
              oninput={onStartTimeChanged}
              type="text" class="form-control" id={id('start')} placeholder="Start" 
              value={sessionTimes().start} size={5} />
          </div>
          <div class="col-2">
            <input title="End time"
              oninput={onEndTimeChanged}
              type="text" class="form-control" id={id('end')} placeholder="End"
              value={sessionTimes().end} size={5} />
          </div>
          <div class="col-2">
            <input title="Tide"
              oninput={(e) => setTide(e.target.value)}
              type="text" class="form-control" id={id('tide')} placeholder="Tide" 
              value={props.entry.tide} />
          </div>
          <div class="col-2">
            <input title="Board"
              oninput={(e) => setBoard(e.target.value)}
              type="text" class="form-control" id={id('board')} placeholder="Board" 
              value={props.entry.board} />
          </div>
          <div class="col-2">
            <input title="Location"
              oninput={(e) => setLocation(e.target.value)}
              type="text" class="form-control" id={id('location')} placeholder="Location" 
              value={props.entry.location} />
          </div>
        </div>

        <div class="row">
          <div class="col-12 p-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" 
              onchange={() => setShowScreenshots(false == showScreenshots())} 
              checked={showScreenshots() ? 'checked': ''} value="" id={id('show-screenshots')} />
            <label class="form-check-label" for={id('show-screenshots')}>Screenshots</label>
          </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12 p-2">
            <small class="form-text text-muted">{dateLabel()}</small>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <textarea
              onchange={(e) => setBody(e.target.value)}
              type="text" class="form-control" id={id('body')} placeholder="..." 
              value={body()} />
          </div>
        </div>

        {/* @todo: Only when creating new entries, otherwise show attachments? */}
        <Show when={showScreenshots()} children={
          <div class="row justify-content-center p-2">
            <div class="card shadow w-75 m-1">
              <div class="card-header"><strong><a target="_blank" href={`https://www.marineweather.co.nz/forecasts/lyall-bay`}>Lyall Bay</a></strong></div>
              <div class="card-body shadow-sm" style="text-align:center">
                <Image width={670} height={537}  src={`/marine-weather/wellington/${format(sessionDate(), 'yyyy-MM-dd')}`} alt="Marine weather" />
              </div>
            </div>

            <div class="card shadow w-75 m-1">
              <div class="card-header"><strong><a target="_blank" href={`https://www.marineweather.co.nz/forecasts/titahi-bay`}>Titahi Bay</a></strong></div>
              <div class="card-body shadow-sm" style="text-align:center">
                <Image width={670} height={537}  src={`/marine-weather/titahi-bay/${format(sessionDate(), 'yyyy-MM-dd')}`} alt="Marine weather" />
              </div>
            </div>
          </div>
        } />

        <div class="row">
          <div class="col-12 mt-1">
            <button type="button" onclick={save} class="btn btn-primary">Save</button>
            <button type="button" onclick={props.onCancel} class="btn btn-primary">Cancel</button>
          </div>
        </div>
      </div>
    </form>
  </>
}