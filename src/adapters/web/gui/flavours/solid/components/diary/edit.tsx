import { createSignal } from "solid-js"
import { mergeProps } from "solid-js/web"
import { DiaryEntry, Session } from "../../../../../../../core/diary/diary-entry"
import { toNewZealandTime } from "../../../../../../../core/date";
import { format, set, parse } from 'date-fns'
import { enNZ } from 'date-fns/locale'

export type Props = {
  entry?: DiaryEntry  
}

type SessionTimes = {
  start: string;
  end: string;
}

export const Edit = (props: Props) => {
  props = mergeProps({ entry: { id: 'draft', timestamp: new Date()}}, props);

  const [dateHint, setDateHint]             = createSignal<string>(null);
  const [sessionDate, setSessionDate]       = createSignal<Date>(props.entry?.session?.start || new Date());
  const [sessionDayText, setSessionDayText] = createSignal<string>(null);
  const [sessionTimes, setSessionTimes]     = createSignal<SessionTimes>({ start: '09.00', end: '11.00'});

  const id = (name: string) => {
    return `${props.entry.id}-${name}`;
  }

  const dateTimeText  = (date: Date) => format(toNewZealandTime(date), 'PPPppp' , { locale: enNZ });
  const dayText       = (date: Date) => format(toNewZealandTime(date), 'PPPP'   , { locale: enNZ });
  const timeText      = (date: Date) => format(toNewZealandTime(date), 'p'      , { locale: enNZ });

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
    // Try and make a valid date and time
    try {
      const sessionDay = new Date(sessionDayText());
      const startTime = parse(sessionTimes().start, 'kk.mm', new Date());
      const endTime   = parse(sessionTimes().end  , 'kk.mm', new Date());

      const startDateAndTime  = set(sessionDay, { hours: startTime.getHours(), minutes: startTime.getMinutes() });
      const endDateAndTime    = set(sessionDay, { hours: endTime.getHours()  , minutes: endTime.getMinutes() });

      setDateHint(`${dayText(startDateAndTime)} ${timeText(startDateAndTime)} - ${timeText(endDateAndTime)}`);
    }
    catch {

    }
  }

  return <>
    <form>
      <div class="form-group">
        <div class="row">
          <div class="col-2">
            <input
              onchange={onDateChange}
              type="text" class="form-control" id={id('date')} placeholder="Date" 
              value={dayText(sessionDate())} />
              <small class="form-text text-muted">{dateHint()}</small>
          </div>
          <div class="col-2">
            <input
              onchange={onStartTimeChanged}
              type="text" class="form-control" id={id('start')} placeholder="Start" 
              value={sessionTimes().start} />
              <small class="form-text text-muted">{dateHint()}</small>
          </div>
          <div class="col-2">
            <input
              onchange={onEndTimeChanged}
              type="text" class="form-control" id={id('end')} placeholder="Start" 
              value={sessionTimes().end} />
              <small class="form-text text-muted">{dateHint()}</small>
          </div>
          <div class="col-2">
            <input 
              type="text" class="form-control" id={id('board')} placeholder="Board" 
              value={props.entry.board} />
          </div>
          <div class="col-2">
            <input 
              type="text" class="form-control" id={id('location')} placeholder="Location" 
              value={props.entry.location} />
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="submit" class="btn btn-primary">Cancel</button>
      </div>
    </form>
  </>
}