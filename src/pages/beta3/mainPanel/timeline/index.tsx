/* eslint-disable react/no-array-index-key */
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
import { db } from '../../../../database/db';

const margin = { top: 10, bottom: 25, left: 60, right: 15 };

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

  const [t, setTransform] = useState<d3.ZoomTransform>(
    d3.zoomIdentity.translate(0, 0).scale(1)
  );

  const [xRange, setXRange] = useState<number[]>([]);
  const [yMax, setYMax] = useState(0);

  useEffect(() => {
    const years = Object.keys(yearToS).filter((d) => d !== '0' && d !== 'None');

    let minV = +years[0];
    let maxV = +years[0];

    years.forEach((y) => {
      const year = +y;
      if (minV > year) {
        minV = year;
      }
      if (maxV < year) {
        maxV = year;
      }
    });
    setXRange([minV, maxV]);
    setYMax(d3.max(years, (d) => yearToS[d].length) as number);
  }, [yearToS]);

  const stackedData = useMemo(() => {
    const keys = Object.keys(eventMap);
    const years = Object.keys(yearToS)
      .filter((d) => d !== '0' && d !== 'None')
      .sort((a, b) => Number(a) - Number(b));
    const data = years.map((key) => {
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

      return { ...type2cnt, year: +key };
    });

    return d3.stack().keys(keys as any)(data as any);
  }, [yearToS]);

  const xScale = useMemo(
    () =>
      t.rescaleX(
        d3
          .scaleLinear()
          .domain(xRange as any)
          .range([0, width - margin.right - margin.left])
          .nice()
      ),
    [t, width, xRange]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, yMax])
        .range([height - margin.top - margin.bottom, 0]),
    [height, yMax]
  );

  const xFormat = useCallback((axis) => axis.tickValues(xScale.ticks(12)), [
    xScale,
  ]);

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

  const onMouseOn = (e: any, year: string) => {
    // const x = e.clientX - ($area.current as any).getBoundingClientRect().x;
    // // const year = xRange[Math.round(indexScale(x))];
    // const year = Math.round(xScale.invert(x));

    let targetData: any = yearToS[year];

    if (!yearToS[year]) return;
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
          title: `count: ${
            targetData.count ? targetData.count : targetData.length
          } year:${year}`,
          style: { opacity: 1, left: e.clientX, top: e.clientY },
        });
      });
    }
  };

  const $area = useRef(null);

  const bandwidth = useMemo(() => {
    const domain = xScale.domain();
    return xScale(domain[0] + 1) - xScale(domain[0]);
  }, [xScale]);

  useEffect(() => {
    const zoom = d3
      .zoom()
      .scaleExtent([1, 32])
      .extent([
        [margin.left, 0],
        [width - margin.right, height],
      ])
      .translateExtent([
        [margin.left, -Infinity],
        [width - margin.right, Infinity],
      ])
      .on('zoom', ({ transform }) => {
        setTransform(transform);
      });

    d3.select($area.current)
      .call(zoom as any)
      .transition()
      .duration(750);
  }, [height, width]);
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
        // onClick={onMouseOn}
        ref={$area}
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* {stackedData.map((d: any, i) => (
              <path
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                d={area(d) as string}
                fill={color[i]}
                // onMouseMove={onMouseOn}
              />
            ))} */}

          {stackedData.map((dArr: any, i: number) => (
            <g key={i}>
              {dArr.map((d: any, j: number) => (
                <rect
                  x={xScale(d.data.year) - bandwidth / 2}
                  y={yScale(d[1])}
                  width={bandwidth}
                  height={yScale(d[0]) - yScale(d[1])}
                  // fill={`url(#Gradient${groups[i]})`}
                  fill={color[i]}
                  onClick={(e) => onMouseOn(e, d.data.year)}
                />
              ))}
            </g>
          ))}

          <rect
            x={-margin.left}
            y={0}
            width={margin.left}
            height={height - margin.bottom - margin.top}
            fill="#fff"
            stroke="none"
          />
          <rect
            x={width - margin.left - margin.right}
            y={0}
            width={margin.right}
            height={height - margin.bottom - margin.top}
            fill="#fff"
          />

          <Axes
            scale={xScale}
            scaleType="bottom"
            transform={`translate(0, ${height - margin.bottom - margin.top})`}
            format={xFormat}
          />
          <Axes scale={yScale} scaleType="left" />
        </g>

        <text x="20" y="8" writingMode="tb" fill="#000000a6">
          Event number
        </text>
      </svg>
    </>
  );
};

export default Timeline;
