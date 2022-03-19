import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Select, Radio } from 'antd';
import * as d3 from 'd3';
import Matrix from './Matrix';
import style from './index.module.scss';
import { getDisplayedFeatureText, histogramHeight } from '../utils';
import useStack from './useStack';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import useNamesMap from './useNodeNamesMap';
import drawCurve from '../../../../utils/curve';
import {
  setFigureId,
  setFigureName,
  updateFigureStatusById,
} from '../../../../reducer/statusSlice';
import useVisibleIndex from './useVisibleIndex';
import { mainColors, mainColors2 } from '../../../../utils/atomTopic';
import Line from './Line';
import InfoGraph from './InfoGraph';
import useYearData from './useYearData';
import eventMap from '../../../../utils/eventMap';
import template from '../../../../utils/tempelate';
import { db } from '../../../../database/db';
import Tooltip from '../../../../components/tooltip/Tip';

interface IFeatureView {
  data: {
    [key: string]: {
      [key: string]: number;
    };
  };
  features: any;
  relationData: {
    [key: string]: {
      [key: string]: any;
    };
  };
}

const { Option } = Select;

const height = 21;
const width = 220;

const matrixWidth = 300;
const matrixHeight = 650;

const visibleCnt = 25;

const defaultLabelColorScale = d3
  .scaleOrdinal()
  .range(['#28aeb1', '#eb7478', '#ffca28'])
  .domain(['included', 'excluded', 'uncertain']);

const FeatureView = ({ data, features, relationData }: IFeatureView) => {
  const [featureToSort, setfeatureToSort] = useState<any>(null);
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const dispatch = useAppDispatch();

  const onChange = useCallback(
    (index) => {
      if (index === '') {
        setfeatureToSort(null);
      } else {
        setfeatureToSort(features[index]);
      }
    },
    [features]
  );

  const groups = useMemo(() => {
    if (featureToSort?.id) {
      return features
        .filter((d: any) => d.id === featureToSort.id)
        .map((d: any) => d.id);
    }
    return features.map((d: any) => d.id);
  }, [featureToSort?.id, features]);
  const figureIdArr = useAppSelector((state) => state.status.figureIdArr);

  // stack按照原序即可，yScale按照排序后的顺序
  const stack = useStack(data, groups, figureIdArr);

  const svgHeight = useMemo(() => height * figureIdArr.length, [
    figureIdArr.length,
  ]);

  const sortedFigureIds = useMemo(() => {
    const featureIdToSort = featureToSort?.id || '';
    const figures = [...figureIdArr];
    if (featureIdToSort !== '') {
      figures.sort(
        (p1, p2) =>
          data?.[p2]?.[featureIdToSort] - data?.[p1]?.[featureIdToSort]
      );
    } else {
      figures.sort((p1, p2) => data?.[p2]?.sum - data?.[p1]?.sum);
    }

    return figures;
  }, [data, featureToSort?.id, figureIdArr]);

  const yScale = useMemo(
    () => d3.scaleBand().domain(sortedFigureIds).range([0, svgHeight]),
    [sortedFigureIds, svgHeight]
  );

  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, Math.max(...figureIdArr.map((id) => data[id]?.sum || 0))])
        .range([0, width]),
    [data, figureIdArr]
  );

  const { nodesMap } = useNamesMap(figureIdArr);

  // TODO matrix提出来管理数据
  // matrix data
  const matrixData = useMemo(() => {
    const matrix = [];
    const n = sortedFigureIds.length;

    let maxCnt = 0;
    for (let i = 0; i < n; i += 1) {
      for (let j = i; j < n; j += 1) {
        const cnt =
          (relationData as any)?.[sortedFigureIds[i]]?.[sortedFigureIds[j]]
            ?.length || 0;

        if (cnt > 0) {
          matrix.push({
            source: i,
            target: j,
            x: j - i,
            y: i + 1 / 2 + j,
            color: cnt,
          });

          if (cnt > maxCnt) {
            maxCnt = cnt;
          }
        }
      }
    }

    const colorScale = d3
      .scaleLinear()
      .domain([0, maxCnt])
      .range(['#ccc', '#000'] as any);

    matrix.forEach((item) => {
      item.color = colorScale(item.color);
    });
    return matrix;
  }, [relationData, sortedFigureIds]);

  const linesData = useMemo(() => {
    const matrix = [];
    const n = figureIdArr.length;

    for (let i = 0; i < n + 1; i += 1) {
      matrix.push({
        pos: [
          [0, 2 * n - (i + i) - 1 / 2],
          [n - i, 2 * n - (i + n) - 1 / 2],
        ],
        target: n - i,
      });

      matrix.push({
        pos: [
          [0, i + i - 1 / 2],
          [n - i, i + n - 1 / 2],
        ],
        source: i,
      });
    }
    return matrix;
  }, [figureIdArr.length]);

  const { rangeX, rangeY } = useMemo(
    () => ({
      rangeX: [0, figureIdArr.length - 1],
      rangeY: [0.5, figureIdArr.length * 2 + 1 / 2 - 2],
    }),
    [figureIdArr.length]
  );

  // matrix tooltip
  const [tooltip, setTooltip] = useState({
    style: { opacity: 0, left: 0, top: 0 },
    data: [],
    title: '',
  });

  const handleMouseOver = useCallback(
    (e, source, target) => {
      const targetData =
        relationData?.[sortedFigureIds?.[source]]?.[
          sortedFigureIds?.[target]
        ] || [];

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
        setTooltip({
          style: { opacity: 1, left: e.clientX, top: e.clientY },
          data: resultData as any,
          title: `count: ${
            targetData.count ? targetData.count : targetData.length
          }`,
        });
      });
    },
    [relationData, sortedFigureIds]
  );

  const handleMouseOut = useCallback(() => {
    setTooltip({
      style: { opacity: 0, left: 0, top: 0 },
      data: [],
      title: '',
    });
  }, []);

  const handleClick = useCallback(
    (e, source, target) => {
      if (source && target) {
        setPair([source, target]);
        handleMouseOver(e, source, target);
      } else {
        setPair(null);
      }
    },
    [handleMouseOver]
  );

  const { initIndex, $container, offset } = useVisibleIndex(21);
  // 矩阵选中的人
  const [pair, setPair] = useState<[number, number] | null>(null);
  const choseFigure = useCallback(
    (fid: string, name: string, i: number) => {
      if (pair?.[0] === i && pair?.[1] === i) {
        setPair(null);
      } else {
        dispatch(setFigureId(fid));
        dispatch(setFigureName(name));
        setPair([i, i]);
      }
    },
    [dispatch, pair]
  );

  const onChangeRadio = useCallback(
    (pid: string, e: any) => {
      if (e.target.value !== undefined) {
        dispatch(
          updateFigureStatusById({
            id: pid,
            status: e.target.value,
          })
        );
      }
    },
    [dispatch]
  );

  // 统计选中的人中每个特征有多少人
  const stackedInfo = useMemo(() => {
    const info = features.map((d: any, i: number) => ({
      key: d.id,
      value: 0,
    }));
    figureIdArr.forEach((fid) => {
      if (data[fid]) {
        info.forEach((item: any) => {
          if (data[fid]?.[item.key]) {
            item.value += 1;
          }
        });
      }
    });

    return info;
  }, [data, features, figureIdArr]);
  const stackedColorScale = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(features.map((d: any) => d.id))
        .range(mainColors2),
    [features]
  );

  const labelInfo = useMemo(() => {
    const keys = ['included', 'excluded', 'uncertain'];
    const info = keys.map((d) => ({
      key: d,
      value: 0,
    }));

    figureIdArr.forEach((fid) => {
      if (info?.[figureStatus[fid]]) {
        info[figureStatus[fid]].value += 1;
      }
    });

    return info;
  }, [figureIdArr, figureStatus]);

  const { data: yearData, range: yearRange } = useYearData(figureIdArr);

  const infoYScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, figureIdArr.length])
        .range([0, histogramHeight - 30]),
    [figureIdArr.length]
  );

  if (figureIdArr.length === 0) {
    return <div />;
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <Select
          style={{ width: 150 }}
          placeholder="Feature number"
          optionFilterProp="children"
          size="small"
          value={getDisplayedFeatureText(featureToSort)}
          onChange={onChange}
        >
          <Option value="">Feature Number</Option>

          {features.map((feature: any, index: number) => (
            <Option key={feature.id} value={index}>
              {feature.descriptorsArr.map((d: any) => `(${d.text})`).join('&')}
            </Option>
          ))}
        </Select>

        <div className={style['figure-header']}>Figure Label</div>

        <div className={style['events-header']}>
          {Object.keys(eventMap).map((e) => (
            <span style={{ '--color': (eventMap as any)[e].color } as any}>
              {e}
            </span>
          ))}
        </div>

        <Select
          style={{ width: 150 }}
          placeholder="All"
          optionFilterProp="children"
          size="small"
        >
          <Option value="">All</Option>

          {Object.keys(eventMap).map((key: string) => (
            <Option key={key} value={key}>
              {key?.[0].toUpperCase() + key.slice(1)}
            </Option>
          ))}
        </Select>
      </div>
      <div className={style.content}>
        <div className={style['content-histogram']}>
          <div>
            <InfoGraph
              width={240}
              height={histogramHeight - 5}
              data={stackedInfo}
              yScale={infoYScale}
              colorScale={stackedColorScale}
            />
          </div>
          <div>
            <InfoGraph
              width={100}
              height={histogramHeight - 5}
              data={labelInfo}
              yScale={infoYScale}
              colorScale={defaultLabelColorScale}
            />
          </div>

          <div className={style.year}>
            <InfoGraph
              width={200}
              height={histogramHeight - 5}
              data={[]}
              yScale={infoYScale}
              colorScale={defaultLabelColorScale}
            >
              {yearRange?.[0]}
            </InfoGraph>
          </div>
        </div>

        <div
          className={[style['content-inner'], 'g-scroll'].join(' ')}
          ref={$container}
        >
          <div
            className={style.highlight}
            style={
              pair
                ? { top: pair?.[0] * 21, opacity: 1 }
                : { opacity: 0, top: -10 }
            }
          />
          <div
            className={style.highlight}
            style={
              pair
                ? { top: pair?.[1] * 21, opacity: 1 }
                : { opacity: 0, top: -10 }
            }
          />
          <div className={style['scroll-wrapper']}>
            <svg
              width={width}
              height={svgHeight}
              viewBox={`0 0 ${width} ${svgHeight}`}
            >
              {stack.map((dArr: any[], i: number) => (
                <g key={groups[i]}>
                  {dArr.map((d, j) => (
                    <rect
                      key={figureIdArr[j]}
                      id={`${figureIdArr[j]}`}
                      x={xScale(d[0])}
                      y={2 + (yScale(figureIdArr[j]) || 0)}
                      width={Math.abs(xScale(d[1]) - xScale(d[0]))}
                      height={height - 4}
                      // fill={`url(#Gradient${groups[i]})`}
                      fill={stackedColorScale(groups[i]) as string}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              ))}
            </svg>

            <div className={style.names}>
              {sortedFigureIds.map((name, i) => (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <p
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  onClick={() => choseFigure(name, nodesMap[name], i)}
                >
                  {nodesMap[name]}
                </p>
              ))}
            </div>

            <div className={style.radios}>
              {sortedFigureIds.map((name, i) => (
                <Radio.Group
                  key={name}
                  value={figureStatus[name]}
                  onChange={(e) => onChangeRadio(name, e)}
                >
                  <Radio value={0} />
                  <Radio value={1} />
                  <Radio value={2} />
                </Radio.Group>
              ))}
            </div>

            <Line
              pids={sortedFigureIds}
              rowHeight={height}
              data={yearData}
              range={yearRange as any}
            />
          </div>
        </div>
      </div>
      <div className={style.wrapper}>
        <svg width="100px" height="610px">
          <g transform={`translate(0, ${histogramHeight})`}>
            {sortedFigureIds.map(
              (d, i) =>
                !!(i >= initIndex && i < initIndex + visibleCnt) && (
                  <path
                    key={d}
                    d={`${drawCurve(
                      [0, 21 * (i - initIndex) + 8 - offset],
                      [
                        70,
                        (610 / sortedFigureIds.length) * (i + 0.5) -
                          histogramHeight,
                      ]
                    )}`}
                    fill="none"
                    stroke="#bbb"
                  />
                )
            )}
          </g>
        </svg>
        <Matrix
          data={matrixData as any}
          linesData={linesData}
          boxSize={610 / sortedFigureIds.length / 2}
          rangeX={rangeX}
          rangeY={rangeY}
          source={pair?.[0]}
          target={pair?.[1]}
          handleClick={handleClick}
          handleMouseOver={handleMouseOver}
          handleMouseOut={handleMouseOut}
        />
      </div>

      <Tooltip
        style={tooltip.style}
        data={tooltip.data}
        title={tooltip.title}
        handleClickX={handleMouseOut}
      />
    </div>
  );
};

export default FeatureView;
