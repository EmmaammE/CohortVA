import React, {useEffect, useState} from 'react';
import FigureTimeline from './FigureTimeline';
import { db } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';

export default ({width = 300, height= 280}) => {
  const [yearToS, setyearToS] = useState({})

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
    setyearToS(data?.yearToS||{});
  }, [data])

  return (
    <FigureTimeline  yearToS={yearToS} width={width} height={height}/>
  )
}