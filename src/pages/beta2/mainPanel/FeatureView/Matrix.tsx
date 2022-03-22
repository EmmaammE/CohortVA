/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import d3lasso from '../../../../utils/lasso';

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
  // source: number | undefined;
  // target: number | undefined;
  pair: number[];
  handleBrush: any;
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
  pair,
  handleClick,
  handleBrush,
  handleMouseOut,
  handleMouseOver,
}: IMatrix) => {
  const pairSet = useMemo(() => new Set(pair), [pair]);
  const $container = useRef(null);

  useEffect(() => {
    const lasso = (d3lasso as any)()
      .items(d3.select($container.current).selectAll('path.data'))
      .targetArea(d3.select($container.current))
      .on('start', () => {
        lasso.items().each(function handler(this: any) {
          this.classList.remove('matrix-selected');
        });
      })
      .on('end', () => {
        const selectedPair = new Set();

        lasso.selectedItems().each(function handler(this: any) {
          this.classList.add('matrix-selected');
          const { source, target } = this.dataset;
          // 这样pair设置的是string,会highlight,没有高亮的link
          selectedPair.add(source);
          selectedPair.add(target);
        });

        handleBrush(Array.from(selectedPair));
      });

    d3.select($container.current).call(lasso);
  }, [data, handleBrush]);

  return (
    <svg
      height={`${matrixHeight}px`}
      width={`${2 + matrixHeight / 2}px`}
      ref={$container}
    >
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
              className="data"
              key={`${d.x}-${d.y}-${boxSize}`}
              d={diamondPath(d.x * boxSize, d.y * boxSize, boxSize, boxSize)}
              fill={d.color}
              opacity={d.opacity}
              cursor="pointer"
              onClick={(e) => handleClick(e, d.source, d.target)}
              data-source={d.source}
              data-target={d.target}
              // onMouseOver={(e) => handleMouseOver(e, d.source, d.target)}
              // onMouseOut={handleMouseOut}
            />
          ))}
        </g>

        {linesData.map(({ pos, source: lineSource, target: lineTarget }, i) => {
          const sourceFlag =
            lineSource !== undefined &&
            (pairSet.has(lineSource) || pairSet.has(lineSource - 1));

          const targetFlag =
            lineTarget !== undefined &&
            (pairSet.has(lineTarget) || pairSet.has(lineTarget - 1));
          return (
            !!(sourceFlag || targetFlag) && (
              <path
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                d={`M ${pos
                  .map((a) => a.map((item: number) => item * boxSize))
                  .join(' ')}`}
                stroke="#333"
                fill="none"
              />
            )
          );
        })}
      </g>
    </svg>
  );
};
export default Matrix;
