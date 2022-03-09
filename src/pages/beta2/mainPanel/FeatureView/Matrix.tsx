import React from 'react';

interface IMatrix {
  data: {
    x: number;
    y: number;
    color: string;
  }[];
  boxSize: number;

  rangeX: number[];
  rangeY: number[];
}

const diamondPath = (x: number, y: number, width: number, height: number) =>
  `M${x} ${y - height} 
    ${x + width} ${y} 
    ${x} ${y + height} 
    ${x - width} ${y} ${x} ${y - height}Z`;

const trianglePath = (rangeX: number[], rangeY: number[], boxSize: number) => {
  const [minX, maxX] = rangeX;
  const [minY, maxY] = rangeY;

  return [
    [minX, minY - 1],
    [maxX + 1, (minY + maxY) / 2],
    [minX, maxY + 1],
  ]
    .map(([a, b]) => [a * boxSize, b * boxSize])
    .join(' ');
};

const Matrix = ({ data, boxSize, rangeX, rangeY }: IMatrix) => (
  <svg height="100%" width="100%">
    <g transform={`translate(0,${boxSize / 2})`}>
      <path
        fill="#acc"
        d={`M ${trianglePath(rangeX, rangeY, boxSize)}`}
        opacity={0.3}
      />
      {data.map((d) => (
        <path
          key={`${d.x}-${d.y}-${boxSize}`}
          d={diamondPath(d.x * boxSize, d.y * boxSize, boxSize, boxSize)}
          fill={d.color}
        />
      ))}
    </g>
  </svg>
);

export default Matrix;
