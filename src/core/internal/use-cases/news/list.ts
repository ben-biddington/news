export const list = async (list, seive, toggles) => {
  const fullList = await list();

  const theIdsToReturn = await seive.apply(fullList);

  if (toggles.get('show-deleted')) {
    return fullList.map(it => {
      it.deleted = false == theIdsToReturn.includes(it.id);
      return it;
    });
  } else {
    return fullList.filter(it => theIdsToReturn.includes(it.id));
  }
}