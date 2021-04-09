import { Toggles } from "../../../toggles";

export const list = async (list, seive, toggles: Toggles) => {
  const fullList = await list();

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