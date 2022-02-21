// 每一行复合特征
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { featureMap } from '../../../../utils/atomTopic';
import { RECT_HEIGHT, SVG_WDITH } from '../constant';
import style from './index.module.scss';
import { ReactComponent as SortICON } from '../../../../assets/icons/sort.svg';
import { ReactComponent as SortedICON } from '../../../../assets/icons/sorted.svg';
import Circle from './Circle';

interface IAtomFeature {
  id: string;
  text: string;
  type: string;
}

export interface FeatureRowProps {
  id: string;
  proportion: number;
  descriptorsArr: IAtomFeature[];
  redundancyFeatures: IAtomFeature[];
  xScale: Function;
  yScale: Function;
  fid2weight: { [key: string]: number };
  sorted: boolean;
  invokeSort: Function;
  updateTip: Function;
}

const FeatureRow = ({
  id,
  proportion,
  descriptorsArr,
  redundancyFeatures,
  xScale,
  yScale,
  fid2weight,
  sorted,
  invokeSort,
  updateTip,
}: FeatureRowProps) => {
  const [expand, setExpand] = useState(false);

  const onClickSortIcon = useCallback(() => {
    invokeSort(id);
  }, [id, invokeSort]);

  const handleMouseMove = useCallback(
    (e, fid) => {
      updateTip(e.clientX, e.clientY, fid);
    },
    [updateTip]
  );

  const handleMouseOut = useCallback(() => {
    updateTip();
  }, [updateTip]);

  return (
    <div className={style['feature-row']}>
      <div className={style.menu}>
        <span>
          {descriptorsArr.map((item) => (
            <p key={item.id} style={{ color: featureMap[item.type] || '#000' }}>
              {item.type || ''}
              {item.text}
            </p>
          ))}
        </span>
      </div>
      <Circle ratio={proportion} className={style.circle} />
      <svg width={`${SVG_WDITH}px`} height={`${RECT_HEIGHT + 2}px`}>
        {Object.keys(fid2weight).map(
          (fid) =>
            !!fid2weight[fid] &&
            xScale(fid) && (
              <rect
                key={fid}
                x={+xScale(fid) + 0.5}
                y={RECT_HEIGHT - yScale(fid2weight[fid])}
                width={(xScale as any).bandwidth() - 1}
                height={yScale(fid2weight[fid])}
                fill="#ccc"
                onMouseMove={(e) => handleMouseMove(e, fid)}
                onMouseOut={handleMouseOut}
              />
            )
        )}
        <line
          x1="0"
          y1={`${RECT_HEIGHT}`}
          x2={`${SVG_WDITH}px`}
          y2={`${RECT_HEIGHT}`}
          stroke="#979797"
        />
      </svg>
      <span className={style.icon}>
        {sorted ? <SortedICON /> : <SortICON onClick={onClickSortIcon} />}
      </span>
    </div>
  );
};

export default FeatureRow;
