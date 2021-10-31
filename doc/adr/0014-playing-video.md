# 14. Playing video

Date: 2021-10-31

## Status

Accepted

## Context

Open this with VLC: `Media` > `Open newtwork stream`.

```
https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635639000~exp=1635639400~acl=/i/dclive_1@667070*~hmac=057377f73fdf24ba26ddae9d141d05c59bb0ae4f91e296e608b2b4aa18d6abd6
```

Not sure if it expires or not, I think it might. Is it `exp=1635639400`?

```
https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635639000~acl=/i/dclive_1@667070*~hmac=057377f73fdf24ba26ddae9d141d05c59bb0ae4f91e296e608b2b4aa18d6abd6
```

Nope, that failed to open.

Larger timestamp `1635646501`

```
https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635639000~exp=1635646501~acl=/i/dclive_1@667070*~hmac=057377f73fdf24ba26ddae9d141d05c59bb0ae4f91e296e608b2b4aa18d6abd6
```

Those links *do* time out.

Also `hmac` changes each time.

## Decision

### Get the streaming url like this

There is no authentication required, so: 

```
ben@bang:~/sauce/news$ curl "https://playback.dacast.com/content/access?contentId=89450_c_581715&provider=dacast"
{"hls":"https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635652055~exp=1635652455~acl=/i/dclive_1@667070*~hmac=22eb3641218f9ccb394b19d150ac0076e90fde95eebb5a9e572381198203f421"} 

```

### Recording

Don't worry about the errors, this works!

```
$ vlc `node dist/cli.js start --use-tor` --sout=file/mp4:test.mp4  
VLC media player 3.0.16 Vetinari (revision 3.0.16-0-g5e70837d8d)
[00005631ad5cbb10] main libvlc: Running vlc with the default interface. Use 'cvlc' to use vlc without interface.
[00005631ad6b3f20] [cli] lua interface: Listening on host "*console".
VLC media player 3.0.16 Vetinari
Command Line Interface initialized. Type `help' for help.
> [00005631ad6a9a20] [http] lua interface: Lua HTTP interface
[00005631ad6a9a20] [http] main interface error: socket bind error: Address already in use
[00005631ad6a9a20] [http] main interface error: socket bind error: Address already in use
[00005631ad6a9a20] [http] main interface error: cannot create socket(s) for HTTP host
[00005631ad6a9a20] [http] lua interface error: Error loading script /snap/vlc/2344/usr/lib/vlc/lua/intf/http.luac: lua/intf/http.lua:338: Failed to create HTTP host
Qt: Session management error: Could not open network socket
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 10, expected 13) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 11, expected 14) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09c8375d80] main decoder error: buffer deadlock prevented
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 12, expected 15) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 13, expected 0) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 14, expected 1) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 15, expected 2) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 3) for PID 0
[00007f09b8000f70] ts demux error: libdvbpsi error (PSI decoder): TS discontinuity (received 0, expected 4) for PID 4096
^C[00005631ad6b3f20] [cli] lua interface error: Error loading script /snap/vlc/2344/usr/lib/vlc/lua/intf/cli.luac: lua/intf/modules/host.lua:289: Interrupted.
QObject::~QObject: Timers cannot be stopped from another thread

```

See [the docs](https://wiki.videolan.org/Documentation:Streaming_HowTo/Receive_and_Save_a_Stream/).

I think, interestingly, it also **appends** to the same file.

Those errors are producing jerky playback though. Trying [this](https://gist.github.com/windyinsc/71b10a7f6b0f9b603af913ad01474539). Tnat did work though the errors are still written as above.

Files size: `6MB/m` -> `360MB/h`

### Full help

```
vlc -H
```

### Help on recording

```
ben@bang:~/sauce/news$ vlc -H | grep record 
VLC media player 3.0.16 Vetinari (revision 3.0.16-0-g5e70837d8d)
          Ratio of images to record. 3 means that one image out of three is
          recorded.
 Record stream output (record)
      --sout-record-dst-prefix <string> 
          Amount of movement required for a mouse gesture to be recorded.
ALSA lib conf.c:3916:(snd_config_update_r) Cannot access file /usr/share/alsa/alsa.conf
 VDR recordings (vdr)
 Support for VDR recordings (http://www.tvdr.de/).
      --input-record-path <string> 
          Directory where the records will be stored
      --input-record-native, --no-input-record-native 
                                 Prefer native stream recording
          When possible, the input stream will be recorded instead of using the
      --global-key-record <string> 
      --key-record <string>      Record
```

[saving files](https://wiki.videolan.org/Documentation:Streaming_HowTo/Receive_and_Save_a_Stream/)

### VLC CLI

This opens the stream:

```
vlc "https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635651197~exp=1635651597~acl=/i/dclive_1@667070*~hmac=b0933e2882f0651213fa5ef580228f16ff9b167c93b30b6f4d9466ca51a26678"
```

https://dcunilive29-lh.akamaihd.net/i/dclive_1@667070/master.m3u8?hdnea=st=1635651638~exp=1635652038~acl=/i/dclive_1@667070*~hmac=d4455d173ef116edb60d72f4b8891579ab2ab430c4a649468ae3fcb13ef6817f

### VLC HTTP server

[docs](https://wiki.videolan.org/VLC_HTTP_requests/)

#### Start server

```
vlc --intf http --http-host 127.0.0.1:1080
```

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
