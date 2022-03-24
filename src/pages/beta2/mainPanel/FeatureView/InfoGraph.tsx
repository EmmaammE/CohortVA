import React, { Children, useMemo } from 'react';
import * as d3 from 'd3';

const margin = {
  left: 10,
  right: 10,
  top: 10,
  bottom: 15,
};

interface IInfoGraph {
  width: number;
  height: number;
  data: { key: string; value: number }[];
  yScale: any;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  colorScale: any;
}

const InfoGraph = ({
  width,
  height,
  yScale,
  colorScale,
  children,
  data = [],
}: IInfoGraph) => {
  const xScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(data?.map((d) => d.key))
        .range([0, width - margin.left - margin.bottom])
        .paddingInner(0.5)
        .paddingOuter(1),
    [data, width]
  );

  // console.log(colorScale?.domain());
  const showText = useMemo(() => data.length < 10, [data.length]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={`M${margin.left} ${height - margin.bottom} 
        ${margin.left} ${height - margin.bottom + 5} 
        ${width - margin.right} ${height - margin.bottom + 5} 
        ${width - margin.right} ${height - margin.bottom}`}
        stroke="#ccc"
        fill="none"
      />
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {data.map((k, i) => (
          <>
            <rect
              key={k.key}
              x={xScale(k.key)}
              y={height - margin.bottom - 5 - yScale(k.value)}
              width={xScale.bandwidth()}
              height={yScale(k.value)}
              fill={colorScale ? colorScale(k.key) : '#ccc'}
            />
            {k.value && showText && (
              <text
                key={`${k.key}t`}
                x={(xScale(k.key) || 0) + xScale.bandwidth() / 2}
                y={Math.max(0, height - margin.bottom - 6 - yScale(k.value))}
                fontSize="8"
                textAnchor="middle"
              >
                {k.value}
              </text>
            )}
          </>
        ))}

        {children}
      </g>
    </svg>
  );
};

export default InfoGraph;
