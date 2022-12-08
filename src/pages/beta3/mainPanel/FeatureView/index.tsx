/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Select, Radio, Slider } from 'antd';
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
import { mainColors2 } from '../../../../utils/atomTopic';
import Line from './Line';
import InfoGraph from './InfoGraph';
import eventMap from '../../../../utils/eventMap';
import template from '../../../../utils/tempelate';
import { db } from '../../../../database/db';
import Tooltip from '../../../../components/tooltip/Tip';
import useRelationData from './useRelationData';
import { IInfoData } from '../useSentence2';
import { ReactComponent as SortICON } from '../../../../assets/icons/sort2.svg';

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
  nodeGroups: any;
}

// eslint-disable-next-line no-shadow
enum EOrderOption {
  Default = 0,
  MatrixOrder = 1,
  Event = 2,
}
// eslint-disable-next-line no-shadow
enum ELabelOption {
  All = 3,
  Included = 0,
  Excluded = 1,
  Uncertain = 2,
}

const { Option } = Select;

const CELL_HEIGHT = 18; // 格子的大小
const width = 210;

const defaultLabelColorScale = d3
  .scaleOrdinal()
  .range(['#00ACFC', '#ff8b8e', '#6f5dab'])
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
  nodeGroups,
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
  const figureIdSelected = useAppSelector((state) => state.status.figureIdArr);
  // 展示label
  const [labelOption, setLabelOption] = useState<number>(ELabelOption.All);
  const onLabelOptionChange = useCallback((e) => {
    setLabelOption(e);
  }, []);

  const figureIdArr = useMemo(() => {
    if (labelOption === ELabelOption.All) {
      return figureIdSelected;
    }
    return figureIdSelected.filter((fid) => figureStatus[fid] === labelOption);
  }, [figureIdSelected, figureStatus, labelOption]);
  // stack按照原序即可，yScale按照排序后的顺序
  const stack = useStack(data, groups, figureIdArr);

  const svgHeight = useMemo(() => CELL_HEIGHT * figureIdArr.length, [
    figureIdArr.length,
  ]);

  // 选择的人物按照什么类型排序， 0： 不起作用， 1：按照矩阵优化方法重排， 2：按照事件数量排
  const [orderOption, setOrderOption] = useState<number>(EOrderOption.Default);
  const clickSort = useCallback(
    (value) => {
      if (orderOption === value) {
        setOrderOption(EOrderOption.Default);
      } else {
        setOrderOption(value);
      }
    },
    [orderOption]
  );

  const sortedFigureIds = useMemo(() => {
    const figures = [...figureIdArr];

    if (orderOption === EOrderOption.MatrixOrder) {
      // const indexMap: { [key: string]: number } = {};
      // nodeGroups.forEach((id, i) => {
      //   indexMap[id] = i;
      // });

      // console.log(indexMap, nodeGroups);

      figures.sort(
        (p1, p2) => (nodeGroups?.[p1] || 0) - (nodeGroups?.[p2] || 0)
      );
    }

    const featureIdToSort = featureToSort?.id || '';

    if (featureIdToSort !== '') {
      figures.sort(
        (p1, p2) =>
          data?.[p2]?.[featureIdToSort] - data?.[p1]?.[featureIdToSort]
      );
    } else {
      figures.sort((p1, p2) => data?.[p2]?.sum - data?.[p1]?.sum);
    }

    if (orderOption === EOrderOption.Event) {
      figures.sort(
        (p1, p2) =>
          (personInfo?.[p2]?.sentenceInfo?.cnt || 0) -
          (personInfo?.[p1]?.sentenceInfo?.cnt || 0)
      );
    }

    return figures;
  }, [
    data,
    featureToSort?.id,
    figureIdArr,
    nodeGroups,
    orderOption,
    personInfo,
  ]);

  const yScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(sortedFigureIds as any)
        .range([0, svgHeight]),
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

  // matrix people range
  const [range, setRange] = useState<[number, number]>([1, 1]);
  const $slider = useRef(null);
  const handleSliderChangeEnd = useCallback((value: any) => {
    setRange(value.map((d: number) => d - 1));
    // setRange([value[0], value[0] + 25]);
  }, []);

  const [rangeProps, setRangeProps] = useState({});
  useEffect(() => {
    // setRangeProps({ value: [...range] });
    // window.requestAnimationFrame(() => {
    //   setRangeProps({});
    // });
  }, [range]);

  // matrix data
  const {
    matrixData,
    linesData,
    rangeX,
    rangeY,
    relationInfo,
  } = useRelationData(sortedFigureIds, relationData, range);

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
  useEffect(() => {
    // label切换会影响index，清除高亮
    setPair(null);
  }, [labelOption]);

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

  const { initIndex, $container, offset } = useVisibleIndex(CELL_HEIGHT);

  useEffect(() => {
    setRange([initIndex, initIndex + CELL_HEIGHT]);
  }, [initIndex]);
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
        if (labelOption !== ELabelOption.All) {
          setLabelOption(ELabelOption.All);
        }

        if (pair && pair.length > 2) {
          const pairSet: any = new Set(pair);
          console.log(pairSet);
          const figures = figureIdArr.filter((d, i) => pairSet.has(`${i}`));
          dispatch(
            updateFigureStatus(
              Object.fromEntries(figures.map((fid) => [fid, e.target.value]))
            )
          );

          dispatch(updateFigureExplored(figures));
        } else {
          dispatch(
            updateFigureStatus(
              Object.fromEntries(
                figureIdArr.map((fid) => [fid, e.target.value])
              )
            )
          );

          dispatch(updateFigureExplored(figureIdArr));
        }
      }
    },
    [dispatch, figureIdArr, labelOption, pair]
  );
  const onChangeRadio = useCallback(
    (pid: string, e: any) => {
      if (e.target.value !== undefined) {
        // 假如开始选了，就把这个还原，不然会很奇怪
        if (labelOption !== ELabelOption.All) {
          setLabelOption(ELabelOption.All);
        }

        dispatch(
          updateFigureStatusById({
            id: pid,
            status: e.target.value,
          })
        );
        dispatch(updateFigureExplored([pid]));
      }
    },
    [dispatch, labelOption]
  );
  const [startQuickSelect, setStartQuickSelect] = useState<boolean>(false);
  const onMouseMoveRadio = useCallback(
    (pid: string, value: number) => {
      if (!startQuickSelect) return;
      if (labelOption !== ELabelOption.All) {
        setLabelOption(ELabelOption.All);
      }
      dispatch(
        updateFigureStatusById({
          id: pid,
          status: value,
        })
      );
      dispatch(updateFigureExplored([pid]));
    },
    [dispatch, labelOption, startQuickSelect]
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
        // 给了一个全局的最大值
        .domain([0, 1200])
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

  useEffect(() => {
    // figureIdArr变化后，恢复状态
    setRange([0, 25]);
    setPair(null);
    setOrderOption(EOrderOption.Default);
    setLabelOption(ELabelOption.All);
    setfeatureToSort(null);
    setSelectedType('');
  }, [figureIdSelected]);

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
                {getDisplayedFeatureText(feature)}
              </Option>
            ))}
          </Select>
        </div>

        <div className={style['figure-header']}>
          <h3>Figure Label</h3>

          <Select
            style={{ width: 95 }}
            optionFilterProp="children"
            size="small"
            value={labelOption}
            onChange={onLabelOptionChange}
          >
            <Option value={ELabelOption.All}>All</Option>
            <Option value={ELabelOption.Included}>Included</Option>
            <Option value={ELabelOption.Excluded}>Excluded</Option>
            <Option value={ELabelOption.Uncertain}>Uncertain</Option>
          </Select>
        </div>

        <div className={style['events-header']}>
          <div>
            <span
              className={selectedType === '' ? 'active-events' : ''}
              style={{ '--color': '#373737' } as any}
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

        <h3 className={style['life-header']}>Figure History</h3>
        <h3 className={style['event-header']}>Event Ranking</h3>
        <h3 className={style['matrix-header']}>Relationship Matrix</h3>

        <div
          className={style.checkall}
          // 有滚动条的时候调整位置
          style={figureIdArr.length > 25 ? { marginRight: '-3px' } : {}}
        >
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
              width={105}
              height={histogramHeight - 5}
              data={labelInfo}
              yScale={infoYScale}
              colorScale={defaultLabelColorScale}
            />
          </div>

          <div className={style.year}>
            <InfoGraph
              width={205}
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
                x="88%"
                y="82%"
                textAnchor="middle"
              >
                {yearRange?.[1]}
              </text>
            </InfoGraph>
          </div>

          <p>
            <SortICON
              onClick={() => clickSort(EOrderOption.Event)}
              style={{
                margin: '0 0 0 80px',
                transform:
                  orderOption !== EOrderOption.Event
                    ? 'rotate(180deg)'
                    : 'inherit',
              }}
            />
          </p>
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
                    ? { top: index * CELL_HEIGHT, opacity: 1 }
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
                      height={CELL_HEIGHT - 4}
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
                  {String(name) === '36240' ? 'Shen Zhonggu' : ''}
                </p>
              ))}
            </div>
            <div
              className={style.radios}
              onMouseDown={() => setStartQuickSelect(!startQuickSelect)}
            >
              {sortedFigureIds.map((name, i) => (
                <Radio.Group
                  key={name}
                  value={figureStatus[name]}
                  onChange={(e) => onChangeRadio(name, e)}
                >
                  <Radio
                    value={0}
                    onMouseEnter={() => onMouseMoveRadio(name, 0)}
                  />
                  <Radio
                    value={1}
                    onMouseEnter={() => onMouseMoveRadio(name, 1)}
                  />
                  <Radio
                    value={2}
                    onMouseEnter={() => onMouseMoveRadio(name, 2)}
                  />
                </Radio.Group>
              ))}
            </div>
            <Line
              pids={sortedFigureIds}
              rowHeight={CELL_HEIGHT}
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

        <div className={style['matrix-sort']}>
          <div className={style['matrix-slider']}>
            <span>Figure {Math.min(1, figureIdArr.length)}</span>
            <Slider
              ref={$slider}
              min={1}
              max={figureIdArr.length}
              range
              step={1}
              onAfterChange={handleSliderChangeEnd}
              // {...rangeProps}
            />
            <span>{figureIdArr.length}</span>
          </div>

          <SortICON
            onClick={() => clickSort(EOrderOption.MatrixOrder)}
            style={
              orderOption !== EOrderOption.MatrixOrder
                ? { transform: 'rotate(180deg)' }
                : {}
            }
          />
        </div>

        <Matrix
          data={matrixData as any}
          linesData={linesData}
          boxSize={
            range
              ? matrixHeight / (range[1] - range[0] + 1) / 2
              : matrixHeight / sortedFigureIds.length / 2
          }
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
