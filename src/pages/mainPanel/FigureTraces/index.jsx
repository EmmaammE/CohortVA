import React, { useEffect, useState } from 'react';
import { db } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import FigureTraces from './FigureTraces';

export default () => {
  const [posToS, setPosToS] = useState({})

  const groupId = useAppSelector(getGroupId);
  const [data, setData] = useState(null);


  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      if (groupData) {
        setData(groupData.sentences);
      }
    }

    load();
  }, [groupId]);

  useEffect(() => {
    // setFeatureId
    setPosToS(data?.posToS||{});
  }, [data])

  return (
    <FigureTraces posToS={posToS} />
  )
}