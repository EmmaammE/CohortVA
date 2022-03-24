import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Select, Radio } from 'antd';
import * as d3 from 'd3';
import Matrix, { matrixHeight } from './Matrix';
import style from './index.module.scss';
import { getDisplayedFeatureText, histogramHeight } from '../utils';
import useStack from './useStack';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import useNamesMap from './useNodeNamesMap';
import {
  setFigureId,
  setFigureName,
  updateFigureExplored,
  updateFigureStatus,
  updateFigureStatusById,
} from '../../../../reducer/statusSlice';
import useVisibleIndex from './useVisibleIndex';
import { mainColors, mainColors2 } from '../../../../utils/atomTopic';
import Line from './Line';
import InfoGraph from './InfoGraph';
import eventMap from '../../../../utils/eventMap';
import template from '../../../../utils/tempelate';
import { db } from '../../../../database/db';
import Tooltip from '../../../../components/tooltip/Tip';
import useRelationData from './useRelationData';
import { IInfoData } from '../useSentence2';
import useBrush from '../featureList/useBursh';

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
  personInfo: {
    [key: string]: IInfoData;
  };
}

const { Option } = Select;

const height = 21;
const width = 210;

const defaultLabelColorScale = d3
  .scaleOrdinal()
  .range(['#28aeb1', '#eb7478', '#ffca28'])
  .domain(['included', 'excluded', 'uncertain']);

const defaultEventColorScale = d3
  .scaleOrdinal()
  .range(Object.keys(eventMap).map((d) => (eventMap as any)[d].color))
  .domain(Object.keys(eventMap));

const FeatureView = ({
  data,
  features,
  relationData,
  personInfo,
}: IFeatureView) => {
  const [featureToSort, setfeatureToSort] = useState<any>(null);
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const dispatch = useAppDispatch();

  const [selectedType, setSelectedType] = useState<string>('');

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

  // matrix data
  const {
    matrixData,
    linesData,
    rangeX,
    rangeY,
    relationInfo,
  } = useRelationData(sortedFigureIds, relationData);

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

  const [pair, setPair] = useState<number[] | null>(null);

  const handleClick = useCallback(
    (e, source, target) => {
      if (source !== null && target !== null) {
        // setPair([source, target, ...(pair || [])]);
        setPair([source, target]);
        handleMouseOver(e, source, target);
      } else {
        setPair(null);
      }
    },
    [handleMouseOver]
  );

  const handleBrush = useCallback((d: null | number[]) => {
    if (d !== null) {
      setPair(d);
    }
  }, []);

  const { initIndex, $container, offset } = useVisibleIndex(21);
  // 矩阵选中的人
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

  const onChangeAllRadio = useCallback(
    (e: any) => {
      if (e.target.value !== undefined) {
        dispatch(
          updateFigureStatus(
            Object.fromEntries(figureIdArr.map((fid) => [fid, e.target.value]))
          )
        );

        dispatch(updateFigureExplored(figureIdArr));
      }
    },
    [dispatch, figureIdArr]
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
        dispatch(updateFigureExplored([String(pid)]));
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

  const eventColorScale = useCallback(
    () => (eventMap as any)[selectedType]?.color || '#ccc',
    [selectedType]
  );
  const { eventsInfo, eventsScale } = useMemo(() => {
    const year2event: { [k: string]: number } = {};
    let maxV = 0;

    Object.keys(personInfo).forEach((pid) => {
      const curData = personInfo[pid];
      curData.sentence?.forEach((sentence) => {
        if (selectedType === '' || sentence.type === selectedType) {
          year2event[sentence.year] = (year2event[sentence.year] || 0) + 1;
          maxV = Math.max(maxV, year2event[sentence.year]);
        }
      });
    });

    return {
      eventsInfo: Object.keys(year2event).map((year) => ({
        key: year,
        value: year2event[year],
      })),
      eventsScale: d3
        .scaleLinear()
        .domain([0, maxV])
        .range([0, histogramHeight - 25]),
    };
  }, [personInfo, selectedType]);

  const yearRange = useMemo(() => {
    let minYear = 999999;
    let maxYear = 0;

    Object.values(personInfo).forEach((item) => {
      if (item?.birth_year && minYear > item.birth_year) {
        minYear = item.birth_year;
      }

      if (item?.death_year && maxYear < item.death_year) {
        maxYear = item.death_year;
      }

      if (item?.c_year) {
        if (item.c_year < minYear) {
          minYear = item.c_year;
        } else if (item.c_year > maxYear) {
          maxYear = item.c_year;
        }
      }
    });

    if (minYear === 999999 && maxYear === 0) return null;

    return [minYear, maxYear];
  }, [personInfo]);

  const infoYScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, figureIdArr.length])
        .range([0, histogramHeight - 25]),
    [figureIdArr.length]
  );

  const relationYScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain(d3.extent(relationInfo, (d) => d.value) as any)
        .range([0, histogramHeight - 20]),
    [relationInfo]
  );

  const allStatus = useMemo(() => {
    for (let i = 0; i < labelInfo.length; i += 1) {
      if (labelInfo[i].value === figureIdArr.length) {
        return i;
      }
    }

    return -1;
  }, [figureIdArr.length, labelInfo]);

  if (figureIdArr.length === 0) {
    return <div />;
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style['feature-header']}>
          <h3>Figure Feature</h3>
          <Select
            style={{ width: 120 }}
            placeholder="Feature number"
            optionFilterProp="children"
            size="small"
            value={getDisplayedFeatureText(featureToSort)}
            onChange={onChange}
          >
            <Option value="">Number</Option>

            {features.map((feature: any, index: number) => (
              <Option key={feature.id} value={index}>
                {feature.descriptorsArr
                  .map((d: any) => `(${d.text})`)
                  .join('&')}
              </Option>
            ))}
          </Select>
        </div>

        <div className={style['figure-header']}>
          <h3>Figure Label</h3>
        </div>

        <div className={style['events-header']}>
          <h3>Figure Event</h3>

          <div>
            <span
              className={selectedType === '' ? 'active-events' : ''}
              style={{ '--color': '#ccc' } as any}
              onClick={() => setSelectedType('')}
            >
              All
            </span>
            {Object.keys(eventMap).map((e) => (
              <span
                key={e}
                className={e === selectedType ? 'active-events' : ''}
                style={{ '--color': (eventMap as any)[e].color } as any}
                onClick={() => setSelectedType(e)}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        <Select
          style={{ width: 120 }}
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
        <div className={style['content-divider']} style={{ left: '458px' }} />
        <div className={style['content-divider']} style={{ left: '225px' }} />

        <div className={style.checkall}>
          <Radio.Group value={allStatus} onChange={onChangeAllRadio}>
            <Radio value={0} />
            <Radio value={1} />
            <Radio value={2} />
          </Radio.Group>
        </div>

        <div className={style['content-histogram']}>
          <div>
            <InfoGraph
              width={210}
              height={histogramHeight - 5}
              data={stackedInfo}
              yScale={infoYScale}
              colorScale={stackedColorScale}
            />
          </div>
          <div>
            <InfoGraph
              width={108}
              height={histogramHeight - 5}
              data={labelInfo}
              yScale={infoYScale}
              colorScale={defaultLabelColorScale}
            />
          </div>

          <div className={style.year}>
            <InfoGraph
              width={180}
              height={histogramHeight - 5}
              data={eventsInfo}
              yScale={eventsScale}
              colorScale={eventColorScale}
            >
              <text fontSize={10} fill="#777" x="0" y="82%" textAnchor="middle">
                {yearRange?.[0]}
              </text>
              <text
                fontSize={10}
                fill="#777"
                x="90%"
                y="82%"
                textAnchor="middle"
              >
                {yearRange?.[1]}
              </text>
            </InfoGraph>
          </div>

          <p>Event number</p>
        </div>

        <div
          className={[style['content-inner'], 'g-scroll'].join(' ')}
          ref={$container}
        >
          {pair &&
            pair.map((index) => (
              <div
                className={style.highlight}
                style={
                  pair
                    ? { top: index * 21, opacity: 1 }
                    : { opacity: 0, top: 0 }
                }
              />
            ))}

          <div className={style['scroll-wrapper']}>
            <svg
              width={width}
              height={svgHeight}
              viewBox={`0 0 ${width} ${svgHeight}`}
            >
              {stack.map((dArr: any, i: number) => (
                <g key={dArr.key}>
                  {dArr.map((d: any, j: number) => (
                    <rect
                      key={figureIdArr[j]}
                      id={`${figureIdArr[j]}`}
                      x={xScale(d[0])}
                      y={2 + (yScale(figureIdArr[j]) || 0)}
                      width={Math.abs(xScale(d[1]) - xScale(d[0]))}
                      height={height - 4}
                      // fill={`url(#Gradient${groups[i]})`}
                      fill={stackedColorScale(dArr.key) as string}
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
              data={personInfo}
              range={yearRange || ([0] as any)}
              type={selectedType}
            />

            <div className={style.theme}>
              {sortedFigureIds.map((id) => (
                <div className={style['theme-item']} key={id}>
                  <p>{personInfo[id]?.sentenceInfo?.cnt}</p>

                  {personInfo[id]?.sentenceInfo?.type.map((type) => (
                    <span
                      key={type}
                      style={{
                        background: (eventMap as any)[type]?.color || '#ccc',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={style.wrapper}>
        <div className={style['matrix-histogram']}>
          <InfoGraph
            width={275}
            height={histogramHeight - 5}
            data={relationInfo}
            yScale={relationYScale}
            colorScale={defaultEventColorScale}
          />
        </div>

        <Matrix
          data={matrixData as any}
          linesData={linesData}
          boxSize={matrixHeight / sortedFigureIds.length / 2}
          rangeX={rangeX}
          rangeY={rangeY}
          pair={pair || []}
          handleBrush={handleBrush}
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
