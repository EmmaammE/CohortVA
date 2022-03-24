import React, { useEffect, useState } from 'react';
import { db } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import InterpersonalEvent from './InterpersonalEvent';

export default () => {
  const groupId = useAppSelector(getGroupId);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      if (groupData) {
        // setData((groupData.sentences as any)?.personToPerson);
      }
    }

    load();
  }, [groupId]);

  return <InterpersonalEvent data={data || {}} />;
};
