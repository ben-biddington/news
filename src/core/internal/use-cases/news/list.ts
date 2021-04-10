import { BlockedHosts } from "../../../blocked-hosts";
import { NewsItem } from "../../../news-item";
import { Toggles } from "../../../toggles";

export const list = async (list, seive, blockedHosts: BlockedHosts, toggles: Toggles) => {
  let fullList : NewsItem[] = await list();

  fullList = await Promise.all(fullList.map(
    async (item: NewsItem) => {
      const isBlocked = await blockedHosts.has(item.host);
      return isBlocked ? item.withBlockedHost(true) : item;
    }));

  const theIdsToReturn = await seive.apply(fullList);

  if (toggles.showDeleted.isOn) {
    return fullList.map(it => {
      it.deleted = false == theIdsToReturn.includes(it.id);
      return it;
    });
  } else {
    return fullList.filter(it => theIdsToReturn.includes(it.id));
  }
}