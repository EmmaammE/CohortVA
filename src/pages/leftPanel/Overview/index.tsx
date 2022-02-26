import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import FeatureNode from './FeatureNode';
import useForceGraph from './useForceGraph';
import style from './index.module.scss';

const initOpacity = 1;
const afterOpacity = 0.4;
const rScale = d3.scaleLinear<number, number>().domain([0, 1]).range([0, 8]);

const Overview = () => {
  const groupId = useAppSelector(getGroupId);
  const cfids = useAppSelector((state) => new Set(state.status.cfids));
  const [data, setData] = useState<IData | null>(null);
  const [hoveredDesId, setDesId] = useState<string | null>(null);

  const { nodes, links, scale } = useForceGraph(data?.cf2cf_pmi || null);

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

  const onHoverDesc = useCallback((id) => {
    setDesId(id);
  }, []);

  return (
    <div>
      <svg viewBox="0 0 200 200">
        <g transform="(-50%, -50%)">
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
                  x={scale(node.x)}
                  y={scale(node.y)}
                  r={rScale(data.descriptions?.[node.id].proportion || 0)}
                  opacity={
                    hoveredDesId === null || hoveredDesId === node.id
                      ? initOpacity
                      : afterOpacity
                  }
                  data={data.descriptions?.[node.id].features || []}
                />
              )
          )}
        </g>
      </svg>
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
    </div>
  );
};

export default Overview;
