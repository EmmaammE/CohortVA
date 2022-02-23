// 每一行复合特征
import React, { useState, useCallback } from 'react';
import { featureMap } from '../../../../utils/atomTopic';
import { RECT_HEIGHT, SVG_WDITH } from '../constant';
import style from './index.module.scss';
import { ReactComponent as SortICON } from '../../../../assets/icons/sort.svg';
import { ReactComponent as SortedICON } from '../../../../assets/icons/sorted.svg';
import Circle from './Circle';
import { IAtomFeature } from '../../types';

interface ICFeature {
  id: string;
  proportion: number;
  descriptorsArr: IAtomFeature[];
}

export interface FeatureRowProps extends ICFeature {
  redundancyFeatures: ICFeature[];
  subFeatures: ICFeature[];
  xScale: Function;
  yScale: Function;
  fid2weight: { [key: string]: number };
  sorted: string;
  invokeSort: Function;
  updateTip: Function;
  selectedPeople?: any;
}

type FeatureType = 'main' | 'sub' | 'redundancy';
interface IMenuItem {
  onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
  descriptorsArr: IAtomFeature[];
  type: FeatureType;
}

const MenuItem = ({ onClick, descriptorsArr, type }: IMenuItem) => (
  <span className={style['menu-item']}>
    <span>
      {descriptorsArr.map((item) => (
        <p
          key={item.id}
          style={{
            color: featureMap[item.type] || '#000',
            fontWeight: type === 'redundancy' ? 400 : 700,
          }}
        >
          {item.text}
        </p>
      ))}
    </span>

    <span className={style['menu-icon']} onClick={onClick} />
  </span>
);

const FeatureRow = ({
  id,
  proportion,
  descriptorsArr,
  redundancyFeatures,
  subFeatures,
  xScale,
  yScale,
  fid2weight,
  sorted,
  invokeSort,
  updateTip,
  selectedPeople,
}: FeatureRowProps) => {
  const [expand, setExpand] = useState(false);
  const [feature, setFeature] = useState<ICFeature | null>(null);

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

  const onClickMenu = useCallback(() => {
    setExpand(!expand);
    setFeature(null);
  }, [expand]);

  // 点击冗余特征或子特征
  const onClickOtherFeature = useCallback((f) => {
    setFeature(f);
  }, []);

  return (
    <div className={style['feature-row']}>
      <div className={style.menu}>
        <MenuItem
          descriptorsArr={descriptorsArr}
          onClick={onClickMenu}
          type="main"
        />

        {expand && (
          <>
            {redundancyFeatures.map(({ id: rId, descriptorsArr: rd }, i) => (
              <MenuItem
                key={rId}
                descriptorsArr={rd}
                onClick={() => onClickOtherFeature(redundancyFeatures[i])}
                type="redundancy"
              />
            ))}
            {subFeatures.map(({ id: rId, descriptorsArr: rd }, i) => (
              <MenuItem
                key={rId}
                descriptorsArr={rd}
                onClick={() => onClickOtherFeature(subFeatures[i])}
                type="redundancy"
              />
            ))}
          </>
        )}
      </div>
      <div className={style['circle-wrapper']}>
        <Circle ratio={proportion} className={style.circle} />
        {feature && (
          <Circle ratio={feature.proportion} className={style.circle} />
        )}
      </div>
      <svg
        width={`${SVG_WDITH}px`}
        height={`${RECT_HEIGHT + (feature ? RECT_HEIGHT : 0) + 2}px`}
      >
        <g>
          {selectedPeople.map(
            (p: any, i: number) =>
              !!fid2weight[p.id] && (
                <rect
                  key={p.id}
                  x={xScale(i) + (xScale(i) - xScale(i - 1)) * 0.1}
                  y={RECT_HEIGHT - yScale(fid2weight[p.id])}
                  width={(xScale(i) - xScale(i - 1)) * 0.8}
                  height={yScale(fid2weight[p.id])}
                  fill="#ccc"
                  onMouseMove={(e) => handleMouseMove(e, p.id)}
                  onMouseOut={handleMouseOut}
                />
              )
          )}
        </g>
        <line
          x1="0"
          y1={`${RECT_HEIGHT}`}
          x2={`${SVG_WDITH}px`}
          y2={`${RECT_HEIGHT}`}
          stroke="#979797"
        />
      </svg>
      <div>
        <span className={style.icon}>
          {id === sorted ? (
            <SortedICON />
          ) : (
            <SortICON onClick={onClickSortIcon} />
          )}
        </span>
        {feature && (
          <span className={style.icon}>
            {feature.id === sorted ? (
              <SortedICON />
            ) : (
              <SortICON onClick={onClickSortIcon} />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default FeatureRow;
