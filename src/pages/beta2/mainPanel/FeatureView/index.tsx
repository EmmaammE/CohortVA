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
import { getDisplayedFeatureText } from '../utils';
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

const visibleCnt = 29;

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

  const colorScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range(['#ccc', '#000'] as any);
  // matrix data
  const matrixData = useMemo(() => {
    const matrix = [];
    const n = sortedFigureIds.length;

    for (let i = 0; i < n; i += 1) {
      for (let j = i; j < n; j += 1) {
        const cnt =
          (relationData as any)?.[sortedFigureIds[i]]?.[sortedFigureIds[j]]
            ?.length || 0;

        if (cnt > 0) {
          matrix.push({
            source: sortedFigureIds[i],
            target: sortedFigureIds[j],
            x: j - i,
            y: i + 1 / 2 + j,
            color: colorScale(cnt),
          });
        }
      }
    }
    return matrix;
  }, [colorScale, relationData, sortedFigureIds]);

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

  const { initIndex, $container, offset } = useVisibleIndex(21);

  const choseFigure = useCallback(
    (fid: string, name: string) => {
      dispatch(setFigureId(fid));
      dispatch(setFigureName(name));
    },
    [dispatch]
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
              {feature.descriptorsArr
                .map((d: any) => `${d.type}(${d.text})`)
                .join('&')}
            </Option>
          ))}
        </Select>
      </div>
      <div className={[style.content, 'g-scroll'].join(' ')} ref={$container}>
        <div className={style['content-inner']}>
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
                    fill={mainColors[i]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </g>
            ))}
          </svg>
          <div>test</div>

          <div className={style.names}>
            {sortedFigureIds.map((name, i) => (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
              <p key={name} onClick={() => choseFigure(name, nodesMap[name])}>
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
        </div>
      </div>
      <div className={style.wrapper}>
        <svg width="100px" height="610px">
          {sortedFigureIds.map(
            (d, i) =>
              !!(i >= initIndex && i < initIndex + visibleCnt) && (
                <path
                  key={d}
                  d={`${drawCurve(
                    [0, 21 * (i - initIndex) + 13 - offset],
                    [70, (610 / sortedFigureIds.length) * (i + 0.5)]
                  )}`}
                  fill="none"
                  stroke="#bbb"
                />
              )
          )}
        </svg>
        <Matrix
          data={matrixData as any}
          linesData={linesData}
          boxSize={610 / sortedFigureIds.length / 2}
          rangeX={rangeX}
          rangeY={rangeY}
          source={0}
          target={5}
        />
      </div>
    </div>
  );
};

export default FeatureView;
