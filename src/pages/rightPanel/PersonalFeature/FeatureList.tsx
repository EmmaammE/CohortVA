import React, { useEffect, useState } from 'react';
import { IData } from '../../../database/db';
import { useAppSelector } from '../../../store/hooks';
import { fetchPersonalFeature } from './model';
import style from '../../leftPanel/Overview/index.module.scss';

type TDescription = IData['descriptions'] extends { [k: string]: infer R }
  ? R
  : never;

interface IFeature {
  cf2cf_pmi?: IData['cf2cf_pmi'];
  descriptions: TDescription[];
}

export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const chosenFigure = useAppSelector((state) => state.status.figureId);
  const [data, setData] = useState<IFeature | null>(null);

  useEffect(() => {
    if (chosenFigure !== '') {
      setLoading(true);
      fetchPersonalFeature(chosenFigure).then((res) => {
        setData(res as IFeature);
        setLoading(false);
      });
    }
  }, [chosenFigure]);

  return (
    <div>
      {loading && <div className="loading-border" />}

      <div className="feature-list-btn">Feature Weight</div>

      <div className={[style.list, 'g-scroll'].join(' ')}>
        {data?.descriptions.map((des, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className={style.item} key={i}>
            <p>{des.features.map((d) => `${d.type}(${d.text})`).join('&')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
