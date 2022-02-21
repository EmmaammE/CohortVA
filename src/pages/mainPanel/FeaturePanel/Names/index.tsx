import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as d3 from 'd3';
import { SVG_WDITH as WIDTH, SVG_HEIGHT as HEIGHT } from '../constant';

interface INames {
  // people: Array<{
  //   // eslint-disable-next-line camelcase
  //   en_name: string;
  //   id: string;
  // }>;
  [key: string]: any;
  xScale: any;
}

const MARGIN = {
  top: 4,
  left: 4,
  right: 4,
  bottom: 2,
};

export const width = WIDTH - MARGIN.left - MARGIN.right;

const invert = (xScale: any) => {
  const domain = xScale.domain();
  const range = xScale.range();
  const scale = d3.scaleQuantize().domain(range).range(domain);

  return (x: any) => scale(x);
};

const Names = ({ xScale }: INames) => {
  // const names = useMemo(() => people.map((item) => item.en_name).sort(), [
  //   people,
  // ]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const $brush = useRef<any>(null);

  const names = useMemo(() => xScale.domain(), [xScale]);

  const brushended = useCallback(
    (e) => {
      if (e.selection) {
        const [x0, x1] = e.selection;
        const selection = [Math.floor(x0), Math.ceil(x1)].map(invert(xScale));
        const tmpNames = [];
        let flag = names.length;
        for (let i = 0; i < names.length; i += 1) {
          if (names[i] === selection[0]) {
            flag = i;
          }
          if (names[i] === selection[1]) break;

          if (i >= flag) {
            tmpNames.push(names[i]);
          }
        }
        setSelectedNames(
          tmpNames.slice(tmpNames.length / 4, (tmpNames.length * 3) / 4)
        );
      }
    },
    [names, xScale]
  );

  const brush = useMemo(
    () =>
      d3
        .brushX()
        .extent([
          [MARGIN.left, MARGIN.top + 1],
          [WIDTH - MARGIN.right, 12],
        ])
        // .on("brush", brushed)
        .on('end', brushended),
    [brushended]
  );

  useEffect(() => {
    const defaultSelection = [10, 50].map(invert(xScale)).map(xScale);
    d3.select($brush.current).call(brush).call(brush.move, defaultSelection);
  }, [brush, xScale]);

  return (
    <svg
      style={{
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
      }}
    >
      <g ref={$brush} />

      <rect
        transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
        x="0"
        y="0"
        width={WIDTH - MARGIN.left - MARGIN.right}
        height="10"
        stroke="#979797"
        fill="transparent"
        pointerEvents="none"
      />

      {selectedNames.map((name, i) => (
        <text
          key={name}
          transform={`translate(${xScale(name)}, 10)`}
          writingMode="vertical-lr"
        >
          {name}
        </text>
      ))}
    </svg>
  );
};
export default Names;
