export type RecordingOptions = {
  durationInMinutes: number;
  file: string;
  expectedSizeInMb: number;
  recording: boolean;
  muxer: string;
  dryRun: boolean;
}