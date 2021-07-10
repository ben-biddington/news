export type Internet = {
  get(url: string, headers: object) : Promise<Response>;
  post(url: string, headers: object, body: object) : Promise<Response>;
  delete(url: string, headers: object) : Promise<Response>;
}

export type Response = {
  statusCode: number;
  headers: any;
  body: string;
}