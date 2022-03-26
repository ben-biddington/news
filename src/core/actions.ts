import { createAction } from "@reduxjs/toolkit"
import { NewsItem } from "./news-item";
export { Action, PayloadAction } from "@reduxjs/toolkit";

export const addReadLater = createAction<NewsItem>("read-later/add");