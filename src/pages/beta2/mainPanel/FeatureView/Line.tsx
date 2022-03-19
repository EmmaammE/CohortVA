import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { IData } from './useYearData';

interface ILine {
  // 排好序的personId
  pids: string[];
  rowHeight: number;
  data: { [k: string]: IData };
  range: [number, number];
}

const width = 160;
const padding = 10;
const heightPadding = 14;

const Line = ({ pids, rowHeight, data, range }: ILine) => {
  const xScale = useMemo(
    () => d3.scaleLinear().domain(range).range([0, width]).nice(),
    [range]
  );

  return (
    <svg
      width={width + padding * 2}
      height={rowHeight * pids.length}
      viewBox={`0 0 ${width + padding * 2} ${rowHeight * pids.length}`}
    >
      <g transform={`translate(${padding},0)`}>
        {pids.map((fid, i) => (
          <g key={fid}>
            {data[fid]?.death_year && data[fid]?.death_year && (
              <rect
                y={i * rowHeight + heightPadding / 2}
                x={xScale(data[fid]?.birth_year || range[0])}
                width={
                  xScale(data[fid]?.death_year || range[1]) -
                  xScale(data[fid]?.birth_year || range[0])
                }
                height={rowHeight - heightPadding}
                stroke="#ccc"
                fill="#fff"
                // fill="#eee"
                // rx="3"
                // ry="3"
              />
            )}
            {!!data[fid]?.c_year && (
              <line
                x1={xScale(data[fid]?.c_year || 0)}
                x2={xScale(data[fid]?.c_year || 0)}
                y1={i * rowHeight}
                y2={i * rowHeight + rowHeight - heightPadding / 2}
                stroke="#B16653"
              />
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default Line;
