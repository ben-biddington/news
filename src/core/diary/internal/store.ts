import { BehaviorSubject, Observable } from 'rxjs';
import { DiaryState} from "../diary-state";

export class Store {
  private subject: BehaviorSubject<DiaryState>;
  private state: DiaryState;

  constructor(state: DiaryState = { entries: [] }) {
    this.state = state;
    this.subject = new BehaviorSubject<DiaryState>(this.state);
  }

  set(state: DiaryState) {
    this.state = state;
    this.subject.next(this.state);
  }

  subscribe(listener: (state: DiaryState) => void) {
    this.subject.subscribe({
      next: listener
    });
  }
}