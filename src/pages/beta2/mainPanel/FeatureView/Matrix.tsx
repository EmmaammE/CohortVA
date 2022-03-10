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
  linesData: {
    pos: number[][];
    source?: number;
    target?: number;
  }[];
  source: number;
  target: number;
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

const Matrix = ({
  data,
  boxSize,
  rangeX,
  rangeY,
  linesData,
  source,
  target,
}: IMatrix) => (
  <svg height="610px" width="100%">
    <defs>
      <clipPath id="triangle">
        <path
          fill="#acc"
          d={`M ${trianglePath(rangeX, rangeY, boxSize)}`}
          opacity={0.3}
        />
      </clipPath>
    </defs>
    <g transform={`translate(15,${boxSize / 2})`}>
      <path
        fill="#acc"
        d={`M ${trianglePath(rangeX, rangeY, boxSize)}`}
        opacity={0.3}
      />

      <g clipPath="url(#triangle)">
        {data.map((d) => (
          <path
            key={`${d.x}-${d.y}-${boxSize}`}
            d={diamondPath(d.x * boxSize, d.y * boxSize, boxSize, boxSize)}
            fill={d.color}
            stroke="#aaa"
          />
        ))}
      </g>

      {linesData.map(({ pos, source: lineSource, target: lineTarget }, i) => (
        <path
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          d={`M ${pos
            .map((a) => a.map((item: number) => item * boxSize))
            .join(' ')}`}
          stroke="#bbb"
          fill="none"
        />
      ))}

      {linesData.map(
        ({ pos, source: lineSource, target: lineTarget }, i) =>
          !!(
            lineSource === source ||
            lineTarget === target ||
            lineSource === source + 1 ||
            lineTarget === target + 1
          ) && (
            <path
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              d={`M ${pos
                .map((a) => a.map((item: number) => item * boxSize))
                .join(' ')}`}
              stroke="#6099c6"
              fill="none"
              strokeWidth={2}
            />
          )
      )}
    </g>
  </svg>
);

export default Matrix;
