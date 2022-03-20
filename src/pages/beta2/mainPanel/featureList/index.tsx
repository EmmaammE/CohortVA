import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import style from './index.module.scss';
import useBrush from './useBursh';
import { invert } from '../../../../utils/scale';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setFigureIdArr } from '../../../../reducer/statusSlice';
import useStack from '../FeatureView/useStack';
import { mainColors, mainColors2 } from '../../../../utils/atomTopic';

interface FeatureListProps {
  loading: boolean;
  data: any;
  xScale: Function;
  yScale: Function;
  groups: string[];
  figureStatus: { [key: string]: number };
}

export const width = 220;
export const height = 920;

const colors = ['var(--included)', 'var(--excluded)', 'var(--uncertain)'];
const strokes = ['#b1b1b1', '#c4c4c4', '#818181'];

const margin = {
  left: 1,
  right: 1,
  top: 1,
  bottom: 1,
};

const FeatureList = ({
  loading,
  data,
  xScale,
  yScale,
  groups,
  figureStatus,
}: FeatureListProps) => {
  const keys = useMemo(() => Object.keys(data).map((d) => +d), [data]);
  const stack = useStack(data, groups, keys);
  const dispatch = useAppDispatch();
  const setFigureIdArrCb = useCallback(
    (figureIdArr: string[]) => {
      dispatch(setFigureIdArr(figureIdArr));
    },
    [dispatch]
  );

  const figureExplored = useAppSelector(
    (state) => new Set(state.status.figureExplored)
  );

  const onBrushEnd = useCallback(
    (e) => {
      if (e.selection && (yScale as any).domain().length) {
        const range = e.selection.map(invert(yScale));
        const result = [];

        const names = (yScale as any)?.domain() || [];
        for (let i = 0; i < names.length; i += 1) {
          const name = names[i];
          if (name === range[1]) {
            result.push(name);
            break;
          }
          if (name === range[0] || result.length > 0) {
            result.push(name);
          }
        }

        setFigureIdArrCb(result);
      }
    },
    [setFigureIdArrCb, yScale]
  );

  const { $brush } = useBrush(width, height, onBrushEnd);

  useEffect(() => {
    // disable brush when loading
    if (loading) {
      d3.select($brush.current)
        .selectAll('rect')
        .style('pointer-events', 'none');
    } else {
      d3.select($brush.current)
        .selectAll('rect')
        .style('pointer-events', 'all');
    }
  }, [$brush, loading]);

  // console.log(keys, stack.length, stack[0].length);
  return (
    <div className={style.wrapper}>
      <svg width="8" height={height} id="people-bar">
        {Object.keys(figureStatus || {}).map((fid) => (
          <rect
            key={fid}
            x={0}
            y={yScale(fid) - 0.5}
            width="8"
            height={(yScale as any).bandwidth() + 1}
            fill={colors[figureStatus[fid]]}
            // stroke={figureExplored.has(fid) ? '#fff' : 'none'}
            opacity={figureExplored.has(fid) ? 1 : 0.5}
          />
        ))}
      </svg>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {stack.map((dArr: any[], i: number) => (
          <g key={groups[i]}>
            {dArr.map((d, j) => (
              <rect
                key={keys[j]}
                id={`${keys[j]}`}
                y={yScale(keys[j]) - 0.5}
                x={xScale(d[0])}
                width={xScale(d[1]) - xScale(d[0])}
                height={(yScale as any).bandwidth() + 1}
                stroke="#fff"
                strokeWidth={0.5}
                // fill={`url(#Gradient${groups[i]})`}
                fill={mainColors2[i]}
              />
            ))}
          </g>
        ))}

        <g ref={$brush} />
      </svg>
    </div>
  );
};

export default FeatureList;
