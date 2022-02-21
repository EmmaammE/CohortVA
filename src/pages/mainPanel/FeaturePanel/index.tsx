/* eslint-disable camelcase */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import featureData from '../../../data/features.json';
import FeatureRow, { FeatureRowProps } from './FeatureRow/FeatureRow';
import handleFeatureData, { getFigure2Feature, getPeople } from './features';
import './index.scss';
import Names, { width } from './Names';
import { RECT_HEIGHT } from './constant';
import { invert } from '../../../utils/scale';

interface IFeaturePanel {
  selectedList: string;
  updateTip: Function;
}

const FeaturePanel = ({ selectedList, updateTip }: IFeaturePanel) => {
  const features = handleFeatureData(featureData, 0);
  const people = getPeople(featureData, 0);
  const { maxFigureWeight, fid2weight } = getFigure2Feature(featureData, 0);
  const { id2node } = featureData as any;

  const [featureIdToSort, setFeatureIdToSort] = useState<string>(
    '-7395654180000042124'
  );

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

  const xScale = useMemo(() => {
    const names = selectedPeople.map((item: any) => item.id);
    return d3.scaleBand().domain(names).range([0, width]);
  }, [selectedPeople]);

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
            xScale={xScale}
            yScale={yScale}
            fid2weight={fid2weight[feature.id]}
            sorted={feature.id === featureIdToSort}
            invokeSort={setFeatureIdToSort}
            updateTip={updateTipHandle}
          />
        ))}
      </div>
      <div className="x-container">{/* <Names xScale={xScale} /> */}</div>
    </div>
  );
};

export default FeaturePanel;
