import { BlockedHosts } from "../../../blocked-hosts";
import { Toggles } from "../../../toggles";
import { apply as block } from "./block";

export const list = async (list, seive, blockedHosts: BlockedHosts, toggles: Toggles) => {
  const fullList = await block(await list(), blockedHosts);

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