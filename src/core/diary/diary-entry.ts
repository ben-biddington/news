export type DiaryEntry = {
  id?: string;
  timestamp?: Date;
  location?: string;
  body: string;
  session?: Session;
  board?: string;
  tide?: string;
}

export type Session = {
  start: Date;
  end: Date;
}