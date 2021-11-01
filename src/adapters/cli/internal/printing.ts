import * as chalk  from 'chalk';
import * as Table from 'cli-table3';
import { RecordingOptions } from './recording-options';

// {
//   "debug": false,
//   "headed": false,
//   "useTor": false,
//   "cache": true
// }
export const printOptionsIf = (condition: boolean, cmd: any) => {
  if (!condition)
    return;

  const size = Object.keys(cmd).length;

  const table = new Table({
    style: {
      compact: false,
      border: [ 'dim' ]
    }
  });

  const keys: string[] = Object.keys(cmd).sort();

  const offOrOn = (value: boolean) => {
    return value ? chalk.bgGreen.whiteBright(' on ') : chalk.dim(' off ')
  }

  table.push(keys.map(key => ({ content: `${chalk.dim.bold(key)}` })));
  table.push(keys.map(key => ({ content: `${offOrOn(cmd[key])}` })));

  console.log(table.toString());
}

export type Ports = {
  fileSize: (file: string) => number;
}

export const printRecordingOptions = (ports: Ports, opts: RecordingOptions) => {
  const table = new Table({
    style: {
      compact: false,
      border: [ ]
    }
  });

  table.push([ 'duration', 'file', 'expected size', 'size' ]);
  table.push([ 
    opts.durationInMinutes, 
    opts.file, 
    `${opts.expectedSizeInMb}MB`, 
    `${ports.fileSize(opts.file)}MB` 
  ]);

  console.log(table.toString());
}