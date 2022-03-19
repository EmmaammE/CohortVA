import React, { useCallback, useState } from 'react';

interface IMatrix {
  data: {
    x: number;
    y: number;
    color: string;
    source: number;
    target: number;
    opacity: number;
  }[];
  boxSize: number;

  rangeX: number[];
  rangeY: number[];
  linesData: {
    pos: number[][];
    source?: number;
    target?: number;
  }[];
  source: number | undefined;
  target: number | undefined;
  handleClick: any;
  handleMouseOver: any;
  handleMouseOut: any;
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

export const matrixHeight = 550;

const Matrix = ({
  data,
  boxSize,
  rangeX,
  rangeY,
  linesData,
  source,
  target,
  handleClick,
  handleMouseOut,
  handleMouseOver,
}: IMatrix) => (
  <svg height={`${matrixHeight}px`} width={`2+${matrixHeight / 2}px`}>
    <defs>
      <clipPath id="triangle">
        <path
          fill="#acc"
          d={`M ${trianglePath(rangeX, rangeY, boxSize)}`}
          opacity={0.3}
        />
      </clipPath>
    </defs>
    <g transform={`translate(3,${boxSize / 2})`}>
      {/* <path
          fill="#acc"
          d={`M ${trianglePath(rangeX, rangeY, boxSize)}`}
          opacity={0.3}
        /> */}

      {linesData.map(({ pos, source: lineSource, target: lineTarget }, i) => (
        <path
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          d={`M ${pos
            .map((a) => a.map((item: number) => item * boxSize))
            .join(' ')}`}
          stroke="#d8d8d8"
          fill="none"
          onClick={(e) => handleClick(e, null, null)}
        />
      ))}

      <g clipPath="url(#triangle)">
        {data.map((d) => (
          <path
            key={`${d.x}-${d.y}-${boxSize}`}
            d={diamondPath(d.x * boxSize, d.y * boxSize, boxSize, boxSize)}
            fill={d.color}
            opacity={d.opacity}
            cursor="pointer"
            onClick={(e) => handleClick(e, d.source, d.target)}
            // onMouseOver={(e) => handleMouseOver(e, d.source, d.target)}
            // onMouseOut={handleMouseOut}
          />
        ))}
      </g>

      {linesData.map(
        ({ pos, source: lineSource, target: lineTarget }, i) =>
          !!(
            source !== undefined &&
            target !== undefined &&
            (lineSource === source ||
              lineTarget === target ||
              lineSource === source + 1 ||
              lineTarget === target + 1)
          ) && (
            <path
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              d={`M ${pos
                .map((a) => a.map((item: number) => item * boxSize))
                .join(' ')}`}
              stroke="#b0b0b0"
              fill="none"
              strokeWidth={2}
            />
          )
      )}
    </g>
  </svg>
);

export default Matrix;
