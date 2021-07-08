export type DiaryEntry = {
  id: string;
  timestamp: Date;
  location?: string;
  body: string;
  session?: Session;
}

export type Session = {
  start: Date;
  end: Date;
}