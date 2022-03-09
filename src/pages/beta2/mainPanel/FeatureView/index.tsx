import React, { useCallback, useMemo, useState } from 'react';
import { Select, Radio } from 'antd';
import * as d3 from 'd3';
import Matrix from './Matrix';
import style from './index.module.scss';
import { getDisplayedFeatureText } from '../utils';
import useStack from './useStack';
import { useAppSelector } from '../../../../store/hooks';
import useNamesMap from './useNodeNamesMap';
import relationData from '../../../../data/relation.json';

interface IFeatureView {
  data: {
    [key: string]: {
      [key: string]: number;
    };
  };
  features: any;
}

const { Option } = Select;

const height = 21;
const width = 220;

const matrixWidth = 300;
const matrixHeight = 650;

const FeatureView = ({ data, features }: IFeatureView) => {
  const [featureToSort, setfeatureToSort] = useState<any>(null);
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

  const groups = useMemo(
    () =>
      features
        .map((f: any) => f.id)
        .sort((a: any, b: any) => (a === featureToSort?.id ? -1 : 1)),
    [featureToSort?.id, features]
  );
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
        .range([width, 0]),
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
  }, [colorScale, sortedFigureIds]);

  const { rangeX, rangeY } = useMemo(
    () => ({
      rangeX: [0, figureIdArr.length - 1],
      rangeY: [0.5, figureIdArr.length * 2 + 1 / 2 - 2],
    }),
    [figureIdArr.length]
  );

  console.log(rangeX, rangeY);

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
      <div className={[style.content, 'g-scroll'].join(' ')}>
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
                    x={xScale(d[1])}
                    y={2 + (yScale(figureIdArr[j]) || 0)}
                    width={Math.abs(xScale(d[1]) - xScale(d[0]))}
                    height={height - 4}
                    fill={`url(#Gradient${groups[i]})`}
                  />
                ))}
              </g>
            ))}
          </svg>
          <div>test</div>

          <div className={style.names}>
            {sortedFigureIds.map((name, i) => (
              <p key={name}>{nodesMap[name]}</p>
            ))}
          </div>

          <div className={style.radios}>
            {sortedFigureIds.map((name, i) => (
              <Radio.Group key={name}>
                <Radio value={1} />
                <Radio value={2} />
                <Radio value={3} />
              </Radio.Group>
            ))}
          </div>
        </div>
      </div>
      <div className={style.wrapper}>
        <Matrix
          data={matrixData as any}
          boxSize={610 / sortedFigureIds.length / 2}
          rangeX={rangeX as any}
          rangeY={rangeY as any}
        />
      </div>
    </div>
  );
};

export default FeatureView;
