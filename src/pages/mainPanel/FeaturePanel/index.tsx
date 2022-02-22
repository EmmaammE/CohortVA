/* eslint-disable camelcase */
import React, { useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import featureData from '../../../data/features.json';
import FeatureRow from './FeatureRow/FeatureRow';
import handleFeatureData, { getFigure2Feature, getPeople } from './features';
import './index.scss';
import Names, { width } from './Names';
import { RECT_HEIGHT } from './constant';

interface IFeaturePanel {
  selectedList: string;
  updateTip: Function;
}

interface IRange {
  // 放大区间
  range: [number, number];
  // 和selectedPeople对应的下标
  domain: [number, number];
}

const FeaturePanel = ({ selectedList, updateTip }: IFeaturePanel) => {
  const features = handleFeatureData(featureData, 0);
  const people = getPeople(featureData, 0);
  const { maxFigureWeight, fid2weight } = getFigure2Feature(featureData, 0);
  const { id2node } = featureData as any;

  const [featureIdToSort, setFeatureIdToSort] = useState<string>(
    '-7395654180000042124'
  );

  // const [selectedNames, setSelectedNames] = useState<IName[]>([]);
  // todo
  // useEffect(() => {
  //   setFeatureIdToSort(features?.[0].id || '');
  // }, [features]);

  // 根据选择的list和排序的复合特征id排序，返回当前显示的人
  const selectedPeople = useMemo(() => {
    const curPeople = (people as any)[selectedList] || [];

    if (featureIdToSort !== '') {
      curPeople.sort(
        (p1: any, p2: any) =>
          (fid2weight[featureIdToSort]?.[p2.id] || 0) -
          (fid2weight[featureIdToSort]?.[p1.id] || 0)
      );
    }

    return [...curPeople];
  }, [featureIdToSort, fid2weight, people, selectedList]);

  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, maxFigureWeight]).range([0, RECT_HEIGHT]), // 100
    [maxFigureWeight]
  );

  const [interval, setInterval] = useState<IRange | null>({
    range: [width / 10, width / 2],
    domain: [selectedPeople.length / 10, selectedPeople.length / 6],
  });

  const selectedNames = useMemo(() => {
    if (interval?.domain) {
      const [i1, i2] = interval?.domain;

      return selectedPeople.slice(i1, i2 + 1).map((d, i: number) => ({
        text: d.en_name,
        index: i1 + i,
      }));
    }
    return [];
  }, [interval?.domain, selectedPeople]);

  const xScale2 = useMemo(() => {
    if (interval === null) {
      return d3
        .scaleLinear()
        .domain([0, selectedPeople.length])
        .range([0, width]);
    }

    const { range, domain } = interval;
    return d3
      .scaleLinear()
      .domain([1, domain[0], domain[1], selectedPeople.length])
      .range([0, range[0], range[1], width]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(interval), selectedPeople.length]);

  const updateTipHandle = useCallback(
    (x, y, fid) => {
      updateTip({
        left: x - 320,
        top: y - 50,
        content: (id2node as any)?.[fid]?.en_name || '',
      });
    },
    [id2node, updateTip]
  );

  return (
    <div id="feature-view">
      <div className="content g-scroll">
        {features.map((feature) => (
          <FeatureRow
            key={feature.id}
            {...(feature as any)}
            xScale={xScale2}
            yScale={yScale}
            selectedPeople={selectedPeople}
            fid2weight={fid2weight[feature.id]}
            sorted={featureIdToSort}
            invokeSort={setFeatureIdToSort}
            updateTip={updateTipHandle}
          />
        ))}
      </div>
      <div className="x-container">
        <span>1</span>
        <Names
          interval={interval}
          xScale={xScale2}
          setInterval={setInterval}
          selectedPeopleSize={selectedPeople.length}
          selectedNames={selectedNames}
        />
        <span>{selectedPeople.length}</span>
      </div>
    </div>
  );
};

export default FeaturePanel;
