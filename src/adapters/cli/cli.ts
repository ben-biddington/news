import { Command }  from 'commander'
import { spawn } from 'child_process';
import * as fs from 'fs';

import { createGet, get } from './internet';
import { printOptionsIf, printRecordingOptions } from './internal/printing';
import { RunningReport, runningReport } from './internal/running-report';
import { RecordingOptions } from './internal/recording-options';

const program = new Command();

program.
  name('node dist/cli.js').
  version('0.0.1');

// https://playback.dacast.com/content/access?contentId=89450_c_442604&provider=dacast
type Beaches = {
  'titahi-bay': string;
  'lyall-bay': string;
  default: string;
}

const beaches = {
  'titahi-bay': '442604',
  'lyall-bay': '581715',
  default: 'lyall-bay'
}

const getUrl = async (opts: { useTor: boolean, beach: string }) => {
  
  const beachName = beaches[opts.beach] || beaches.default;
  
  const reply = await createGet({ useTor: opts.useTor })({ 
    url: `https://playback.dacast.com/content/access?contentId=89450_c_${beachName}&provider=dacast` });

  return JSON.parse(reply.body).hls;
}

//
// vlc `node dist/cli.js watch`
//
program.
  command("watch").
  argument('[beach]'      , 'The beach name'              , 'lyall-bay').
  argument('[duration]'   , 'How many minutes to play for', 10).
  description('Open VLC GUI with the video playing').
  option('    --use-tor', 'use tor', false).
  action(async (beach: string, duration: number, cmd: any) => {
    const ports = { fileSize: (name: string) => fs.existsSync(name) ? fs.statSync(name).size/(1000 * 1000) : 0 };  
    
    const recordingOpts: RecordingOptions =  { 
      muxer: cmd.muxer, 
      recording: cmd.record, 
      durationInMinutes: duration, 
      dryRun: cmd.dryRun,
      expectedSizeInMb: 0,
      file: 'playing on screen'
     };

    const messages = [];

    const runtimeInMs = duration * 60 * 1000;

    const kill = cmd.dryRun ? () => Promise.resolve() : vlc(
      false,
      [],
      (m) => messages.push(`[${new Date().toTimeString()}] [inf] ${m}`),
      () => getUrl({ useTor: cmd.useTor, beach }));

    const report = new RunningReport(ports, recordingOpts);

    report.start();

    const timeout = setTimeout(async () => {
      await report.stop();

      clearTimeout(timeout);

      console.log(`[${new Date().toTimeString()}] [inf] stopping...`);
      await kill();
      console.log(`[${new Date().toTimeString()}] [inf] stopped`);

      process.exit(0);
    }, cmd.dryRun ? 500 : runtimeInMs)
  });

//
// npx tsc && node dist/cli.js record 20 --use-tor
//
program.
  command("record").
  argument('[duration]'   , 'How many minutes to record for', 10).
  argument('[file]'       , 'The file to write to'          , 'test.mp4').
  option('-m  --muxer <muxer>'    , 'The muxer to use'      , 'ts').
  option('-v  --verbose'  , 'verbose output'                , false).
  option('    --use-tor'  , 'use tor'                       , false).
  option('-d  --dry-run'  , 'dry run'                       , false).
  option('    --no-record', 'turn off recording'            , false).
  description('Record to file').
  action(async (duration: number, file: string, cmd: any) => {
    const ports = { fileSize: (name: string) => fs.existsSync(name) ? fs.statSync(name).size/(1000 * 1000) : 0 };  
    const recordingOpts: RecordingOptions =  { 
      muxer: cmd.muxer, 
      recording: cmd.record, 
      durationInMinutes: duration, 
      file: file,
      expectedSizeInMb: duration * 6,
      dryRun: cmd.dryRun
     };

    const getUrl = async () => {
      const reply = await createGet({ useTor: cmd.useTor })
      ({ url: `https://playback.dacast.com/content/access?contentId=89450_c_581715&provider=dacast` });
    
      return JSON.parse(reply.body).hls;
    }

    const messages = [];

    const runtimeInMs = duration * 60 * 1000;

    // https://wiki.videolan.org/VLC_command-line_help/
    const args = cmd.record ? [ `--sout=file/${recordingOpts.muxer}:${file}`, '--sout-file-append' ] : [];

    const kill = cmd.dryRun ? () => Promise.resolve() : vlc(
      cmd.record == true,
      args,
      (m) => messages.push(`[${new Date().toTimeString()}] [inf] ${m}`),
      getUrl);

    printOptionsIf(cmd.verbose, cmd);

    const report = new RunningReport(ports, recordingOpts);

    report.start();

    const timeout = setTimeout(async () => {
      await report.stop();

      clearTimeout(timeout);

      console.log(`[${new Date().toTimeString()}] [inf] stopping...`);
      await kill();
      console.log(`[${new Date().toTimeString()}] [inf] stopped`);

      process.exit(0);
    }, cmd.dryRun ? 500 : runtimeInMs)
  });

const vlc = (headless: boolean, args: string[], handler: (data) => void, getUrl: () => Promise<string>) => {
  let process;

  const executable = headless ? 'nvlc' : 'vlc';

  const start = async () => {
    process = spawn(executable, [...args, (await getUrl())]);

    process.on('data'    , handler);
    process.on('message' , handler);
    process.on('error'   , handler);
    process.on('exit'    , handler);

    handler(`[vlc] Started`);
  }

  start();

  const intervalMs = 1000 * 60 * 5; 

  const pulse = setInterval(() => {
    handler(`[vlc] Restarting after ${intervalMs/60}ms`);
    process?.kill();
    start();
  }, intervalMs); // 5 mins

  return () => {
    handler(`[vlc] [kill] Killing`);
    clearInterval(pulse);
    process?.kill();
  };
}

program.parse(process.argv);
