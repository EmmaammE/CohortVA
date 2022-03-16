import React, { Children, useMemo } from 'react';
import * as d3 from 'd3';

const margin = {
  left: 20,
  right: 20,
  top: 10,
  bottom: 10,
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
  return (
    <svg width={width} height={height}>
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
              y={height - 15 - yScale(k.value)}
              width={xScale.bandwidth()}
              height={yScale(k.value)}
              fill={colorScale(k.key)}
            />
            {k.value && (
              <text
                x={(xScale(k.key) || 0) + xScale.bandwidth() / 2}
                y={height - 20 - yScale(k.value)}
                fontSize="10"
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
