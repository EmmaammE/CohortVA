import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import FeatureNode, { SIZE } from './FeatureNode2';
import useForceGraph from './useForceGraph';
import style from './index.module.scss';
import useTooltip from '../../../hooks/useTooltip';

const initOpacity = 1;
const afterOpacity = 0.4;
// const rScale = d3.scaleLinear<number, number>().domain([0, 1]).range([0, 8]);

interface IOverview {
  show: boolean;
}
const Overview = ({ show }: IOverview) => {
  const groupId = useAppSelector(getGroupId);
  const cfids = useAppSelector((state) => new Set(state.status.cfids));
  const [data, setData] = useState<IData | null>(null);
  const [hoveredDesId, setDesId] = useState<string | null>(null);

  const { nodes, scale } = useForceGraph(data?.cf2cf_pmi || null);
  const { element, setTipInfo } = useTooltip();

  const [sortedIndex, setSortedIndex] = useState<number>(0);
  const keys = useMemo(() => {
    const curKeys = Object.keys(data?.descriptions || {});

    if (sortedIndex === 0) {
      curKeys.sort(
        (k1, k2) =>
          (data?.descriptions?.[k2]?.proportion || 0) -
          (data?.descriptions?.[k1]?.proportion || 0)
      );
    }
    return curKeys;
  }, [data?.descriptions, sortedIndex]);

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      if (groupData) {
        setData(groupData);
      }
    }

    load();
  }, [groupId]);

  const handleMouseOver = useCallback(
    (id: string, e: any) => {
      setDesId(id);
      setTipInfo({
        content:
          data?.descriptions?.[id].features
            .map((d) => `${d.type}(${d.text})`)
            .join('\n') || '',
        left: e.nativeEvent.offsetX,
        top: e.nativeEvent.offsetY,
      });
    },
    [data?.descriptions, setTipInfo]
  );

  const handleMouseOut = useCallback(() => {
    setDesId(null);
    setTipInfo({ content: '' });
  }, [setTipInfo]);

  return (
    <div className={style.container}>
      <div className={style['svg-wrapper']}>
        <svg viewBox="0 0 200 200" style={show ? { width: '50%' } : {}}>
          <g>
            {nodes.map(
              (node: any) =>
                data?.descriptions?.[node.id]?.features &&
                node.x &&
                node.y && (
                  <FeatureNode
                    key={node.id}
                    id={node.id}
                    x={scale(node.x)}
                    y={scale(node.y)}
                    r={data.descriptions?.[node.id].proportion || 0}
                    opacity={
                      hoveredDesId === null || hoveredDesId === node.id
                        ? initOpacity
                        : afterOpacity
                    }
                    stroke={cfids.has(node.id) ? '#000' : ''}
                    data={data.descriptions?.[node.id].features || []}
                    handleMouseOut={handleMouseOut}
                    handleMouseOver={handleMouseOver}
                  />
                )
            )}
          </g>
        </svg>
      </div>
      <div className={style.btns}>
        <div style={sortedIndex === 0 ? { background: '#efefef' } : {}}>
          Figure Count
        </div>
        <div style={sortedIndex === 1 ? { background: '#efefef' } : {}}>
          Feature Weight
        </div>
      </div>
      <div className={[style.list, 'g-scroll'].join(' ')}>
        {keys.map((cfid) => {
          const value = data?.descriptions?.[cfid] || null;
          if (value) {
            return (
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              <div
                className={style.item}
                key={cfid}
                onMouseOver={() => setDesId(cfid)}
                onMouseOut={() => setDesId(null)}
              >
                <span>
                  <svg
                    width={`${SIZE * 1.5}px`}
                    height={`${SIZE * 1.5}px`}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                  >
                    <FeatureNode
                      x={5}
                      y={5}
                      r={value.proportion}
                      opacity={initOpacity}
                      data={value.features}
                      id={cfid}
                    />
                  </svg>
                </span>
                <p>
                  {value.features.map((d) => `${d.type}(${d.text})`).join('&')}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
      {element}
    </div>
  );
};

export default Overview;
