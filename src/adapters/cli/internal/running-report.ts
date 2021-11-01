import * as chalk  from 'chalk';
import * as Table from 'cli-table3';
import { formatDuration, intervalToDuration } from 'date-fns'
import { RecordingOptions } from "./recording-options";

export type Ports = {
  fileSize: (file: string) => number;
}

export class RunningReport {
  private readonly ports: Ports;
  private readonly opts: RecordingOptions;
  private intervalTask: NodeJS.Timeout;
  private startedAt: Date;
  private stopping: boolean = false;
  private stopped: boolean = false;

  constructor(ports: Ports, opts: RecordingOptions) {
    this.ports = ports;
    this.opts = opts;
  }

  start() {
    this.startedAt = new Date();
  
    this.render(this.createReport());
  
    this.intervalTask = setInterval(
      () => {
        if (this.stopping) {
          this.stopped = true;
        }

        this.render(this.createReport());
        
      }, 2500);
  
    return () => this.stop();
  }

  stop() {
    this.opts.recording = false;
    this.stopping = true;

    return new Promise((accept) => {
      const task = setInterval(() => {
        if (this.stopped === true) {
          clearInterval(task);
          clearInterval(this.intervalTask);

          accept(0);
        }
      }, 500)
    })
  }

  private render(table: Table.Table) {
    // https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
    const ESC = '\u001B[';
    process.stdout.write(`${ESC}5A` + `${ESC}0J` + `${ESC}0G` + table.toString() + '\n')
  }

  private createReport() {
    const table = new Table({
      colWidths: [15, 20, 20],
      style: {
        compact: false,
        border: [ ]
      }
    });
  
    table.push([ 'recording', 'duration', 'running', 'file', 'expected size', 'size' ]);
    table.push([ 
      this.opts.recording ? chalk.bgRed.whiteBright.bold('  on  ') : chalk.bgWhite.black.bold.dim('  off  '),
      `${this.opts.durationInMinutes} minutes`, 
      formatInterval({ start: this.startedAt, end: new Date()}),
      this.opts.file, 
      `${this.opts.expectedSizeInMb.toFixed(2)}MB`, 
      `${this.ports.fileSize(this.opts.file).toFixed(2)}MB` 
    ]);

    return table;
  }
}

export const runningReport = async (ports: Ports, opts: RecordingOptions) => {
  const startedAt = new Date();

  const createReport = () => {
    const table = new Table({
      colWidths: [15, 20, 20],
      style: {
        compact: false,
        border: [ ]
      }
    });
  
    table.push([ 'recording', 'duration', 'running', 'file', 'expected size', 'size' ]);
    table.push([ 
      opts.recording ? chalk.bgRed.whiteBright.bold('  on  ') : chalk.bgWhite.black.bold.dim('  off  '),
      `${opts.durationInMinutes} minutes`, 
      formatInterval({ start: startedAt, end: new Date()}),
      opts.file, 
      `${opts.expectedSizeInMb.toFixed(2)}MB`, 
      `${ports.fileSize(opts.file).toFixed(2)}MB` 
    ]);

    return table.toString() + '\n';
  }

  // https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
  const ESC = '\u001B[';

  process.stdout.write(createReport());

  const interval = setInterval((args) => {
    process.stdout.write(`${ESC}5A` + `${ESC}0J` + `${ESC}0G` + createReport())
  }, 5000);

  return () => clearInterval(interval);
}

const formatInterval = (interval: { start: Date, end: Date }) => {
  const milliseconds = (interval.end as Date).getTime() - (interval.start as Date).getTime();

  const format = [
    { filter: (it: number)  => it < 1000 * 60         , format: [ 'seconds' ]},
    { filter: (it: number)  => it < 1000 * 60 * 60    , format: [ 'minutes' ]},
    { filter: (it: number)  => it < 1000 * 60 * 60 * 4, format: [ 'hours', 'minutes' ]},
    { filter: (_: number)   => true                   , format: [ 'days', 'hours' ]},
  ].find(({ filter })       => filter(milliseconds))?.format;

  return formatDuration(intervalToDuration(interval), { format });
}