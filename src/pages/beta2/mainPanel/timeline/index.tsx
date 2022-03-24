/* eslint-disable react/prop-types */
import * as d3 from 'd3';
import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import Tooltip from '../../../../components/tooltip/Tip';
import Axes from '../../../../components/charts/Axes';
import eventMap from '../../../../utils/eventMap';
import template from '../../../../utils/tempelate';
import { invert } from '../../../../utils/scale';
import { db } from '../../../../database/db';

const margin = { top: 5, bottom: 25, left: 40, right: 10 };

interface ITimeline {
  yearToS: {
    [key: string]: { sentence: string; type: string }[];
  };
  width: number;
  height: number;
}

const color = Object.keys(eventMap).map((d) => (eventMap as any)[d].color);
const Timeline = ({ yearToS, width, height }: ITimeline) => {
  const [state, setState] = useState({
    style: { opacity: 0, left: 0, top: 0 },
    data: [],
    title: '',
  });

  const handleTooltipClick = () => {
    const style = { ...state.style, opacity: 0, left: 0, top: 0 };
    setState({ ...state, style });
  };

  const [xRange, setXRange] = useState<string[]>([]);
  const [yMax, setYMax] = useState(0);

  useEffect(() => {
    const years = Object.keys(yearToS).sort((a, b) => Number(a) - Number(b));
    setXRange(years);
    setYMax(d3.max(years, (d) => yearToS[d].length) as number);
  }, [yearToS]);

  const stackedData = useMemo(() => {
    const keys = Object.keys(eventMap);
    const data = xRange.map((key) => {
      const yearData = yearToS?.[key] || [];

      const type2cnt: { [k: string]: number } = keys.reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: 0,
        }),
        {}
      );
      yearData.forEach((d) => {
        type2cnt[d.type] += 1;
      });

      return { ...type2cnt, year: key };
    });

    return d3.stack().keys(keys as any)(data as any);
  }, [xRange, yearToS]);

  const xScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(xRange as any)
        .range([0, width - margin.right - margin.left]),
    [width, xRange]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, yMax])
        .range([height - margin.top - margin.bottom, 0]),
    [height, yMax]
  );

  const xFormat = useCallback(
    (axis) => axis.tickValues(xScale.domain().filter((d, i) => !(i % 10))),
    [xScale]
  );

  const { style, data, title } = state;

  const area = d3
    .area()
    .curve(d3.curveCatmullRom)
    .x((d: any, i) => xScale(d.data.year) as any)
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

  const indexScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([margin.left, width - margin.right])
        .range([0, xRange.length - 1]),
    [width, xRange.length]
  );

  const onMouseOn = (e: any) => {
    const x = e.clientX - ($area.current as any).getBoundingClientRect().x;

    const year = xRange[Math.round(indexScale(x))];

    let targetData: any = yearToS[year];
    // tempDict的格式：{nodeOrEdgeId:nodeNameOrEdgeLabel}
    if (targetData.length > 50) {
      const count = targetData.length;
      targetData = targetData.slice(0, 20);
      targetData.count = count;
    }
    if (targetData.length > 0) {
      Promise.all(
        targetData.map(async ({ sentence }: { sentence: string }) => {
          // 下次再改成批量读取sentence吧
          const sentenceData = await db.sentence.get(sentence);

          const vKey: string[] = [];
          sentenceData?.words.forEach((word, idx) => {
            vKey.push(word);
            vKey.push(sentenceData?.edges[idx]);
          });
          const v = await template(sentenceData?.category, vKey, 'name');
          return v;
        })
      ).then((resultData) => {
        setState({
          data: resultData as any,
          title: `count: ${targetData.count ? targetData.count : targetData.length
            } year:${year}`,
          style: { opacity: 1, left: e.clientX, top: e.clientY },
        });
      });
    }
  };

  const $area = useRef(null);

  return (
    <>
      <Tooltip
        style={style}
        data={data}
        title={title}
        handleClickX={handleTooltipClick}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={`${width}px`}
        height={`${height}px`}
        onClick={onMouseOn}
        ref={$area}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <Axes
            scale={xScale}
            scaleType="bottom"
            transform={`translate(0, ${height - margin.bottom - margin.top})`}
            format={xFormat}
          />
          <Axes scale={yScale} scaleType="left" />

          <g transform={`translate(${xScale.bandwidth() / 2}, 0)`}>
            {stackedData.map((d: any, i) => (
              <path
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                d={area(d) as string}
                fill={color[i]}
              // onMouseMove={onMouseOn}
              />
            ))}
          </g>
        </g>
      </svg>
    </>
  );
};

export default Timeline;
