import React, { useEffect, useState } from 'react';
import { db, IData } from '../../../database/db';
import { useAppSelector } from '../../../store/hooks';
import { fetchPersonalFeature } from './model';
import style from '../../leftPanel/Overview/index.module.scss';
import { getGroupId } from '../../../reducer/cohortsSlice';

type TData = {
  des: string;
  value: number;
};
export default () => {
  const chosenFigure = useAppSelector((state) => state.status.figureId);
  const groupId = useAppSelector(getGroupId);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );
  // 当前这个group所有的复合特征
  const [data, setData] = useState<any | null>(null);
  const [figureData, setFigureData] = useState<TData[]>();

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      if (groupData) {
        setData(groupData.descriptions);
      }
    }

    load();
  }, [groupId]);

  useEffect(() => {
    if (chosenFigure !== '') {
      db.cohorts
        .get([groupId, classifierIndex])
        .catch((e) => console.log(e))
        .then((res) => {
          const curFigureData: TData[] = [];
          const figureDataObject =
            res?.value.pid2allcfvalue?.[chosenFigure] || {};

          Object.keys(figureDataObject).forEach((featureId) => {
            if (figureDataObject[featureId]) {
              curFigureData.push({
                des: data?.[featureId].features
                  .map((d: any) => `${d.type}(${d.text})`)
                  .join('&'),
                value: figureDataObject[featureId],
              });
            }
          });
          curFigureData.sort((a, b) => b.value - a.value);
          setFigureData(curFigureData);
        });
    }
  }, [chosenFigure, classifierIndex, data, groupId]);

  return (
    <div>
      <div className="feature-list-btn">Feature Weight</div>

      <div className={[style.list, 'g-scroll'].join(' ')}>
        {figureData?.map((d) => (
          <div className={style.item} key={d.des}>
            <p>{d.des}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
