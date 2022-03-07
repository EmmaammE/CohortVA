/* eslint-disable no-shadow */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import * as d3 from 'd3';
import Button from '../../../components/button/Button';
import useTooltip from '../../../hooks/useTooltip';
import FigureTraces from '../../mainPanel/FigureTraces';
import FigureTimeline from '../../mainPanel/FigureTimeline';
import './index.scss';
import FeatureView from './FeatureView';
import FeatureList, { width, height, padding } from './featureList';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { db } from '../../../database/db';
import { setCfids } from '../../../reducer/statusSlice';
import Gradients from './Gradients';

type TFeature = {
  descriptorsArr: {
    type: string;
    id: string;
  }[];
};

const { Option } = Select;

const getDisplayedFeatureText = (feature: TFeature) =>
  feature?.descriptorsArr?.map((d: any) => `${d.type}(${d.text})`).join('&') ||
  '';

const MainPanel = () => {
  const { element, setTipInfo } = useTooltip();

  const groupId = useAppSelector(getGroupId);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );
  const dispatch = useAppDispatch();

  const [features, setFeatures] = useState<any>([]);
  const [people, setPeople] = useState<any>({});
  const [maxFigureWeight, setMaxFigureWeight] = useState<number>(0);
  const [fid2weight, setFid2Weight] = useState<any>({});
  const [featureToSort, setfeatureToSort] = useState<any>(null);

  const [endPoints, setEndPoints] = useState<number[]>([]);

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

  useEffect(() => {
    async function load() {
      const item = await db.cohorts.get({
        id: groupId,
        index: classifierIndex,
      });

      const {
        features = [],
        people = {},
        maxFigureWeight = 0,
        fid2weight = {},
      } = item?.value || {};

      console.log(groupId, item?.value);

      setFeatures(features);
      setPeople(people);
      setMaxFigureWeight(maxFigureWeight);
      setFid2Weight(fid2weight);
      setfeatureToSort(features?.[0]?.id || '');

      dispatch(setCfids(features.map((f: any) => f.id)));
    }

    load();
  }, [classifierIndex, dispatch, groupId]);

  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxFigureWeight + padding])
        .range([width, 0]), // 100
    [maxFigureWeight]
  );

  const yScale = useMemo(() => {
    const featureIdToSort = featureToSort?.id || '';
    const list = Object.values(people || {})
      .map((peopleList: any) => {
        if (featureIdToSort !== '') {
          peopleList.sort(
            (p1: any, p2: any) =>
              (fid2weight?.[p2.id]?.[featureIdToSort] || 0) -
              (fid2weight?.[p1.id]?.[featureIdToSort] || 0)
          );
        } else {
          peopleList.sort(
            (p1: any, p2: any) =>
              (fid2weight?.[p2.id]?.sum || 0) - (fid2weight?.[p1.id]?.sum || 0)
          );
        }

        return peopleList.map((d: any) => d.id);
      })
      .reduce((acc, cur) => acc.concat(cur), []);

    return d3.scaleBand().domain(list).range([0, height]);
  }, [featureToSort, fid2weight, people]);

  useEffect(() => {
    const list: any[] = Object.values(people || {});

    // const sum: any = list.reduce((acc, cur) => acc + (cur as any).length, 0);

    console.log(list);

    let sum = 0;
    const curEndPoints: number[] = [];
    list.forEach((item: any) => {
      sum += item.length;
      curEndPoints.unshift(sum);
    });

    const scale = d3.scaleLinear().domain([1, sum]).range([0, 920]);
    setEndPoints(curEndPoints.map(scale));
  }, [people]);

  return (
    <div id="main-panel">
      <h2 className="g-title">Cohort Explanation View </h2>

      <div className="op-container">
        <Button text="Update" />
      </div>

      <div className="feature-content">
        <div className="feature-content-left">
          <h3 className="g-title">Figure Overview</h3>
          <Select
            style={{ width: 220 }}
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
          <svg className="svg-gradient">
            <Gradients features={features} />
          </svg>
          <FeatureList
            data={fid2weight}
            yScale={yScale}
            xScale={xScale}
            groups={features
              .map((f: any) => f.id)
              .sort((a: any, b: any) => (a === featureToSort?.id ? -1 : 1))}
            endPoints={endPoints}
          />
        </div>
        <div className="feature-content-right">
          <div className="feature-content-right-top">
            <h3 className="g-title">Figure Selection</h3>
            <FeatureView />
          </div>
          <div className="map-view">
            <h3 className="g-title">Cohort Map</h3>
            <FigureTraces />
          </div>
          <div className="timeline-view">
            <h3 className="g-title">Cohort Timeline</h3>
            <FigureTimeline width={800} height={280} />
          </div>
        </div>
      </div>

      {element}
    </div>
  );
};

export default MainPanel;
