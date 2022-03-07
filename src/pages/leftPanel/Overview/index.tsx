import React, { useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import FeatureNode from './FeatureNode';
import useForceGraph from './useForceGraph';
import style from './index.module.scss';
import useTooltip from '../../../hooks/useTooltip';

const initOpacity = 1;
const afterOpacity = 0.4;
const rScale = d3.scaleLinear<number, number>().domain([0, 1]).range([0, 8]);

interface IOverview {
  show: boolean;
}
const Overview = ({ show }: IOverview) => {
  const groupId = useAppSelector(getGroupId);
  const cfids = useAppSelector((state) => new Set(state.status.cfids));
  const [data, setData] = useState<IData | null>(null);
  const [hoveredDesId, setDesId] = useState<string | null>(null);

  const { nodes, links, scale } = useForceGraph(data?.cf2cf_pmi || null);
  const { element, setTipInfo } = useTooltip();

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
            <g>
              {links.map((link: any) => {
                if (
                  link.source?.id !== link.target?.id &&
                  cfids.has(link.source.id) &&
                  cfids.has(link.target.id)
                ) {
                  return (
                    <line
                      key={link.index}
                      x1={scale(link.source?.x)}
                      y1={scale(link.source?.y)}
                      x2={scale(link.target?.x)}
                      y2={scale(link.target?.y)}
                      strokeWidth={1}
                      stroke="#979797"
                      strokeDasharray="2 2"
                    />
                  );
                }

                return null;
              })}
            </g>
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
                    r={rScale(data.descriptions?.[node.id].proportion || 0)}
                    opacity={
                      hoveredDesId === null || hoveredDesId === node.id
                        ? initOpacity
                        : afterOpacity
                    }
                    data={data.descriptions?.[node.id].features || []}
                    handleMouseOut={handleMouseOut}
                    handleMouseOver={handleMouseOver}
                  />
                )
            )}
          </g>
        </svg>
      </div>
      <div className={[style.list, 'g-scroll'].join(' ')}>
        {Object.keys(data?.descriptions || {}).map((cfid) => {
          const value = data?.descriptions?.[cfid] || null;
          if (value) {
            const size = rScale(value.proportion) * value.features.length * 2;

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
                    width={size + 2}
                    height={rScale(value.proportion) * 2 + 2}
                    style={{
                      width: `${size + 2}px`,
                      height: `${rScale(value.proportion) * 2 + 2}px`,
                    }}
                  >
                    <FeatureNode
                      x={size / 2 + 1}
                      y={rScale(value.proportion) + 1}
                      r={rScale(value.proportion)}
                      opacity={initOpacity}
                      data={value.features}
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
