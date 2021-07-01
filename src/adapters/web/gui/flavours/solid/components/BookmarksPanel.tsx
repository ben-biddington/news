import { For, mergeProps } from 'solid-js';

import { Bookmark } from "../../../../../../core/bookmark"

type Props = {
  bookmarks?: Bookmark[];
  onDelete?: (id: string) => void;
}

export const BookmarksPanel = (props: Props) => {
  props = mergeProps({ onDelete: () => {}}, props);
  
  const child = (bookmark: Bookmark, i: () => number) => {
    return <>
     <tr class="item" id={`bookmark-${bookmark.id}`}>
        <td width="10" style="vertical-align: middle;text-align: center;">{i()+1}</td>
        <td width="10" style="vertical-align: middle;text-align: center;">
          <a href="javascript:void(0)" onclick={() => props.onDelete(bookmark.id)} class="icon del">
            <svg alt="delete" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
              <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
            </svg>
          </a>
        </td>
        <td>
          <div>
            <a class="title" href={bookmark.url}><span class="bookmark-title">{bookmark.title}</span></a>
          </div>
        </td>
      </tr>
    </>
  }

  return <>
    <div id="bookmarks">
        <table class="table table-hover">
          <thead>
            <tr>
              <td colspan="3"><strong>Bookmarks</strong> ({props.bookmarks.length})</td>
            </tr>
          </thead>
          <tbody class="visible items">
          <For each={props.bookmarks} children={child} />
          </tbody>
          <tfoot class="recessed-reversed">
            <tr>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>`
  </>
}