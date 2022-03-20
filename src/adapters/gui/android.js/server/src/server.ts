import { Application } from "express";
//@ts-ignore
import express from "express";

const app: Application = express();
const port = 3000;

app.use(express.static('../build'));

app.listen(port, (): void => {
  console.log(`Connected successfully on port ${port}`);
});