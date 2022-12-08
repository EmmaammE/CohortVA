import React, { useEffect, useState } from 'react';
import { db } from '../../../../database/db';

type TMap = { [k: string]: string };

const useNamesMap = (ids: string[]) => {
  const [nodesMap, setNodesMap] = useState<TMap>({});

  useEffect(() => {
    // get string id to name
    db.node.bulkGet(ids.map((d) => +d)).then((res) => {
      const map: TMap = {};
      res.forEach((node) => {
        if (node?.id && node?.en_name) {
          map[node.id] = node.en_name;
        }
      });

      setNodesMap(map);
    });
  }, [ids]);

  return {
    nodesMap,
  };
};

export default useNamesMap;
