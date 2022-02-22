import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as d3 from 'd3';
import { SVG_WDITH as WIDTH, SVG_HEIGHT as HEIGHT } from '../constant';

export interface IName {
  text: string;
  index: number;
}
interface INames {
  interval: any;
  xScale: any;
  setInterval: Function;
  selectedPeopleSize: number;
  selectedNames: IName[];
}

const MARGIN = {
  top: 4,
  left: 4,
  right: 4,
  bottom: 2,
};

export const width = WIDTH - MARGIN.left - MARGIN.right;

const Names = ({
  interval,
  xScale,
  setInterval,
  selectedPeopleSize,
  selectedNames,
}: INames) => {
  const $brush = useRef<any>(null);
  const [selection, setSelection] = useState<[number, number]>([0, width]);

  const brushended = useCallback(
    (e) => {
      if (e.selection && e.selection.join(' ') !== selection.join(' ')) {
        const [x0, x1] = e.selection;
        // 选择的序号
        const index1 = Math.floor(xScale.invert(x0));
        const index2 = Math.ceil(xScale.invert(x1));

        const x2 = xScale(index1);
        const x3 = xScale(index2);
        // console.log('brushended', index1, index2, selection, x0, x1);
        const range: [number, number] = [
          x2 / 2,
          x3 + (selectedPeopleSize - x3) / 2,
        ];

        setInterval({
          range,
          domain: [
            Math.max(0, index1 - 1),
            Math.min(index2 + 1, selectedPeopleSize),
          ],
        });
        setSelection(range);
      }
    },
    [selectedPeopleSize, selection, setInterval, xScale]
  );

  const brush = useMemo(
    () =>
      d3
        .brushX()
        .extent([
          [MARGIN.left, MARGIN.top + 1],
          [WIDTH - MARGIN.right, 12],
        ])
        .on('end', brushended),
    [brushended]
  );

  useEffect(() => {
    d3.select($brush.current).call(brush);
  }, [brush]);

  useEffect(() => {
    if (interval?.range) {
      d3.select($brush.current).call(brush.move, interval.range);
    }
  }, [brush, interval?.range]);

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

      {selectedNames.map((d, i) => (
        <text
          key={d.text}
          transform={`translate(${xScale(d.index) + MARGIN.left}, 18)`}
          writingMode="vertical-lr"
          fontSize="10px"
          className="names-text"
        >
          {d.text}
        </text>
      ))}

      {/* <line x1="0" y1="0" x2={`${WIDTH}px`} y2="0" stroke="#979797" /> */}
    </svg>
  );
};
export default Names;
