import React, { useEffect, useMemo, useState } from 'react';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import useForceGraph from './useForceGraph';

const Overview = () => {
  const groupId = useAppSelector(getGroupId);
  const [data, setData] = useState<IData | null>(null);

  const { nodes, links } = useForceGraph(data?.cf2cf_pmi || null);

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      console.log(groupData);
      if (groupData) {
        setData(groupData);
      }
    }

    load();
  }, [groupId]);

  return (
    <div>
      <svg viewBox="-100 -100 200 200">
        <g>
          {nodes.map((node: any) => (
            <circle r="4" cx={node.x} cy={node.y} key={node.id} />
          ))}
        </g>
      </svg>
      <div />
    </div>
  );
};

export default Overview;
