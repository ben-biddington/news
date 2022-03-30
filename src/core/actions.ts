import { createAction } from "@reduxjs/toolkit"
import { NewsItem } from "./news-item";
export { Action, PayloadAction } from "@reduxjs/toolkit";

export const addReadLater = createAction<NewsItem>("read-later/add");
export const deleteReadLater = createAction<string>("read-later/delete");
export const setReadLaterList = createAction<NewsItem[]>("read-later/set");
export const getPreview = createAction<NewsItem>("preview/get");
export const hidePreview = createAction<NewsItem>("preview/hide");
