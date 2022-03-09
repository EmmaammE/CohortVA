import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import style from './index.module.scss';
import useBrush from './useBursh';
import { invert } from '../../../../utils/scale';
import { useAppDispatch } from '../../../../store/hooks';
import { setFigureIdArr } from '../../../../reducer/statusSlice';
import useStack from '../FeatureView/useStack';

interface FeatureListProps {
  data: any;
  xScale: Function;
  yScale: Function;
  groups: string[];
  endPoints: number[];
}

export const width = 220;
export const height = 920;

const colors = ['#fff', '#c4c4c4', '#818181'];
const strokes = ['#b1b1b1', '#c4c4c4', '#818181'];

const margin = {
  left: 1,
  right: 1,
  top: 1,
  bottom: 1,
};

const FeatureList = ({
  data,
  xScale,
  yScale,
  groups,
  endPoints,
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

  const onBrushEnd = useCallback(
    (e) => {
      if (e.selection) {
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

  // console.log(keys, stack.length, stack[0].length);
  return (
    <div className={style.wrapper}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {stack.map((dArr: any[], i: number) => (
          <g key={groups[i]}>
            {dArr.map((d, j) => (
              <rect
                key={keys[j]}
                id={`${keys[j]}`}
                y={yScale(keys[j])}
                x={xScale(d[0])}
                width={xScale(d[1]) - xScale(d[0])}
                height={(yScale as any).bandwidth()}
                stroke="none"
                fill={`url(#Gradient${groups[i]})`}
              />
            ))}
          </g>
        ))}

        <g ref={$brush} />
      </svg>
      <svg width="8" height={height} id="people-bar">
        {endPoints.map((ep, i) => (
          <rect
            key={ep}
            x="0"
            y="0"
            width="8"
            height={ep}
            fill={colors[i]}
            stroke={strokes[i]}
          />
        ))}
      </svg>
    </div>
  );
};

export default FeatureList;
