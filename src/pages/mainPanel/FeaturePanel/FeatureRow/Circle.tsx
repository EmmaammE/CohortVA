import React, { useMemo } from 'react';
import * as d3 from 'd3';

interface ICircle {
  ratio: number;
  className: string;
}

const arc = d3.arc();

const INNER_RADIUS = 14;
const OUTER_RADIUS = 20;

const SIZE = 50;

const option = {
  innerRadius: INNER_RADIUS,
  outerRadius: OUTER_RADIUS,
  startAngle: 0,
  endAngle: Math.PI * 2,
};

const bgStyle = {
  fill: '#fff',
  stroke: '#efefef',
};

const fgStyle = {
  fill: '#eee',
};

const Circle = ({ ratio, className }: ICircle) => {
  const fgOption = useMemo(
    () => ({
      innerRadius: INNER_RADIUS,
      outerRadius: OUTER_RADIUS,
      startAngle: 0,
      endAngle: Math.PI * 2 * ratio,
    }),
    [ratio]
  );

  return (
    <svg width={`${SIZE}px`} height={`${SIZE}px`} className={className}>
      {/* <path d={`${arc(option)}`} transform="translate(25, 25)" {...bgStyle} /> */}
      <path d={`${arc(fgOption)}`} transform="translate(25, 25)" {...fgStyle} />
      <text
        x="50%"
        y="50%"
        v-if="ratio"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fill="#706e6e"
      >{`${(ratio * 100).toFixed(1)}%`}</text>
    </svg>
  );
};

export default Circle;
