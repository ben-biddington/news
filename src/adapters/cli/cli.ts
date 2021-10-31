import { Command }  from 'commander'
import { createGet, get } from './internet';
import { spawn } from 'child_process';
import { on } from 'events';
import { propagateChangeConfirmed } from 'mobx/dist/internal';

const program = new Command();

program.
  name('node dist/cli.js').
  version('0.0.1');

//
// vlc `node dist/cli.js start`
//

program.
  command("start").
  description('Open VLC GUI with the video playing').
  option('    --use-tor', 'use tor', false).
  action(async (cmd: any) => {
    const reply = await createGet({ useTor: cmd.useTor })
      ({ url: `https://playback.dacast.com/content/access?contentId=89450_c_581715&provider=dacast` });
    
    const url = JSON.parse(reply.body).hls;

    console.log(url);
  });

program.
  command("record").
  argument('[duration]' , 'How many minutes to record for', 10).
  argument('[file]'     , 'The file to write to', 'test.mp4').
  option('    --use-tor', 'use tor', false).
  description('Record to file').
  action(async (duration: number, file: string, cmd: any) => {
    const getUrl = async () => {
      const reply = await createGet({ useTor: cmd.useTor })
      ({ url: `https://playback.dacast.com/content/access?contentId=89450_c_581715&provider=dacast` });
    
      return JSON.parse(reply.body).hls;
    }

    const messages = [];

    const runtimeInMs = duration * 60 * 1000;

    // https://wiki.videolan.org/VLC_command-line_help/
    const args = [`--sout=file/ts:${file}`, '--sout-file-append'];

    const kill = vlc(
      args,
      (m) => messages.push(`[${new Date().toTimeString()}] [inf] ${m}`),
      getUrl);

    console.log( 
      `Running for ${runtimeInMs}ms`, 
      `Writing to <${file}>`,
      `Expected size <${duration * 6}MB>`,
      '' 
    );

    const pulse = setInterval(() => {
      process.stdout.write(`.`);
    }, 1000 * 5);

    const timers = [
      setInterval(() => process.stdout.write(' [30s] '), 1000 * 30),
      setInterval(() => process.stdout.write('\n'), 1000 * 180),
    ];

    const timeout = setTimeout(async () => {
      clearInterval(pulse);
      timers.forEach(clearInterval);
      clearTimeout(timeout);

      console.log('\n');

      if (messages.length > 0) {
        messages.forEach(console.log);
      }

      console.log(`[${new Date().toTimeString()}] [inf] stopping...`);
      await kill();
      console.log(`[${new Date().toTimeString()}] [inf] stopped`);

      process.exit(0);
    }, runtimeInMs)
  });

const vlc = (args: string[], handler: (data) => void, getUrl: () => Promise<string>) => {
  let process;

  const start = async () => {
    process = spawn('vlc', [...args, (await getUrl())]);

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
    process.kill();
    start();
  }, intervalMs); // 5 mins

  return () => {
    handler(`[vlc] [kill] Killing`);
    clearInterval(pulse);
    process.kill();
  };
}

program.parse(process.argv);

