import React, { useEffect, useMemo } from 'react';
import * as d3 from 'd3';

interface IMatrix {
  height: number;
  data: {
    [key: string]: {
      [key: string]: any[];
    };
  };
}

const diamondPath = (x: number, y: number, size: number) =>
  `M${x} ${y} 
    ${x + size} ${y - size} 
    ${x + size * 2} ${y} 
    ${x + size} ${y - size * 2} ${x} ${y}Z`;

const rectScale = (n: number, size: number) => {
  const width = n * size;
  return (i: number): number => i * size;
};
const Matrix = ({ height, data }: IMatrix) => {
  const scale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(Object.keys(data))
        .range([0, (1.414 * height) / 2]),
    [data, height]
  );

  const indexScale: any = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(Object.keys(data))
        .range([1, Object.keys(data).length]),
    [data]
  );

  const bandwidth = scale.bandwidth();

  const boxSize = useMemo(() => {
    const size = scale.bandwidth() / 2;
    return size * 1.414;
  }, [scale]);

  console.log(1.414 * 0.5 * scale.bandwidth(), boxSize);

  const colorScale = useMemo(() => {
    let maxCnt = 0;
    Object.values(data).forEach((personToPerson) => {
      Object.values(personToPerson).forEach((events) => {
        maxCnt = Math.max(maxCnt, events.length);
      });
    });

    return d3
      .scaleLinear()
      .domain([0, maxCnt])
      .range(['#ddd', '#111'] as any);
  }, [data]);

  return (
    <g style={{ transform: 'rotate(135deg)', transformOrigin: '50% 50%' }}>
      {Object.keys(data).map((source) =>
        Object.keys(data[source]).map(
          (target, i) =>
            !!scale(target) &&
            !!scale(source) && (
              <rect
                key={`${source}-${target}`}
                x={scale(source)}
                y={scale(target)}
                width={boxSize}
                height={boxSize}
                fill="#eee"
                stroke="#ccc"
              />
              // <path
              //   key={`${source}-${target}`}
              //   d={diamondPath(
              //     scale(source) || 0,
              //     scale(target) || 0,
              //     boxSize / 2
              //   )}
              // />
            )
        )
      )}
    </g>
  );
};

export default Matrix;
