import { Log } from "../../../../../core/logging/log";
import { CustomEventEmitter } from "../../../../../core/application";

export type LogNotifier = Log & {
  on: (type: 'info' | 'trace', fn: (m: any) => void) => void;
}

export class NotifyingLog implements LogNotifier {
  private readonly events: CustomEventEmitter = new CustomEventEmitter();
  
  on = (type: 'info' | 'trace', fn: (m: any) => void) => {
    this.events.on(type, (...args: any[]) => fn(args[0]));
  }
  
  info = (message: any) => this.events.emit('info', message);
  trace = (message: any) => this.events.emit('trace', message)
}