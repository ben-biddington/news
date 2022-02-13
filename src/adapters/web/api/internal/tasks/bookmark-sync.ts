import { CockroachBookmarksDatabase } from '../../../../database/cockroachdb/bookmarks';
import { Bookmarks } from '../../../../../adapters/database/bookmarks';
import { Bookmark } from '../../../../../core/bookmark';

export type Ports = {
  locaBookmarks: Bookmarks;
  cockroachBookmarks: CockroachBookmarksDatabase;
  log?: (m) => void;
};

export const sync = (ports: Ports) => {
  const intervalInMinutes = 5; 
  
  const { log = () => console.log} = ports

  const task = setInterval(async () => {
    const [local, remote] = await Promise.all([
      ports.locaBookmarks.list(),
      ports.cockroachBookmarks.list()
    ]);

    const missing: Bookmark[] = (local as Bookmark[]).filter(bookmark => false == remote.some(it => it.id === bookmark.id));

    log(`[bookmark-sync] local has <${local.length}> items, remote has <${remote.length}>`);
    log(`[bookmark-sync] remote is missing <${missing.length}> items`);

    await ports.cockroachBookmarks.add(...missing);
  }, 1000 * 60 * intervalInMinutes);

  log(`[bookmark-sync] task runs every <${intervalInMinutes}m>`);

  return () => {
    clearInterval(task);
    log(`[bookmark-sync] stopped`);
  }
}