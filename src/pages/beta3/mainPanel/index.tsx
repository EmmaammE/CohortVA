/* eslint-disable no-shadow */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import * as d3 from 'd3';
import { useLiveQuery } from 'dexie-react-hooks';
import Button from '../../../components/button/Button';
import useTooltip from '../../../hooks/useTooltip';
import FigureTraces from '../../mainPanel/FigureTraces/FigureTraces';
import './index.scss';
import FeatureView from './FeatureView';
import FeatureList, { width, height } from './featureList';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getGroupId, updateGroup } from '../../../reducer/cohortsSlice';
import { db } from '../../../database/db';
import {
  setCfids,
  setFigureIdArr,
  setFigureStatus,
  setMainFeatures,
} from '../../../reducer/statusSlice';
import { getDisplayedFeatureText, padding } from './utils';
import useSentence from './useSentence2';
import { BASE_CODE, mainColors, mainColors2 } from '../../../utils/atomTopic';
import Timeline from './timeline';
import { setLinks } from '../../../reducer/featureSlice';
import legend from '../../../assets/legends/3.svg';
import eventMap from '../../../utils/eventMap';
import { ReactComponent as SortICON } from '../../../assets/icons/sort2.svg';

const { Option } = Select;

const MainPanel = () => {
  const { element, setTipInfo } = useTooltip();

  const groupId = useAppSelector(getGroupId);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );

  const figureIdSelected = useAppSelector((state) => state.status.figureIdArr);
  const dispatch = useAppDispatch();
  const setFigureStatusCb = useCallback(
    (s) => {
      dispatch(setFigureStatus(s));
    },
    [dispatch]
  );
  const figureStatus = useAppSelector((state) => state.status.figureStatus);

  const [features, setFeatures] = useState<any>([]);
  const [people, setPeople] = useState<any>({});
  const [maxFigureWeight, setMaxFigureWeight] = useState<number>(0);
  const [fid2weight, setFid2Weight] = useState<any>({});
  const [featureToSort, setfeatureToSort] = useState<any>(null);

  const onChange = useCallback(
    (index) => {
      if (index === '') {
        setfeatureToSort(null);
      } else {
        setfeatureToSort(features[index]);
      }
      dispatch(setFigureIdArr([]));
    },
    [dispatch, features]
  );

  const cohortData = useLiveQuery(
    () =>
      db.cohorts.get({
        id: groupId,
        index: classifierIndex,
      }),
    [groupId, classifierIndex]
  );
  useEffect(() => {
    if (!cohortData?.value) return;

    const {
      features = [],
      people = {},
      maxFigureWeight = 0,
      fid2weight = {},
    } = cohortData.value;

    setFeatures(features);
    setPeople(people);
    setMaxFigureWeight(maxFigureWeight);
    setFid2Weight(fid2weight);
    setfeatureToSort(features?.[0]?.id || '');

    dispatch(
      setMainFeatures(
        features.map((f: any) =>
          f.descriptorsArr.map((d: any) => `${d.type}(${d.text})`).join(' & ')
        )
      )
    );

    const linkSet = new Set<string>();
    const curCfids = features.map((f: any) => f.id);

    dispatch(setCfids(curCfids));
    features.forEach(({ id, redundancyFeatures }: any) => {
      redundancyFeatures.forEach((rf: any) => {
        linkSet.add(`${id}_${rf.id}`);
      });
    });

    dispatch(setLinks(Array.from(linkSet)));
  }, [cohortData, dispatch]);

  const [sortByStatus, setSortByStatus] = useState<boolean>(false);

  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, maxFigureWeight]).range([0, width]), // 100
    [maxFigureWeight]
  );

  const yScale = useMemo(() => {
    const featureIdToSort = featureToSort?.id || '';

    let list = [];

    if (sortByStatus) {
      list = Object.values(people || {})
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
                (fid2weight?.[p2.id]?.sum || 0) -
                (fid2weight?.[p1.id]?.sum || 0)
            );
          }

          return peopleList.map((d: any) => d.id);
        })
        .reduce((acc, cur) => acc.concat(cur), []);
    } else {
      list = Object.values(people || {}).reduce(
        (acc, cur) =>
          (acc as string[]).concat((cur as { id: string }[]).map((d) => d.id)),
        []
      ) as string[];

      list.sort((p1, p2) => {
        if (featureIdToSort !== '') {
          return (
            (fid2weight?.[p2]?.[featureIdToSort] || 0) -
            (fid2weight?.[p1]?.[featureIdToSort] || 0)
          );
        }

        return (fid2weight?.[p2]?.sum || 0) - (fid2weight?.[p1]?.sum || 0);
      });
    }

    if (list.length < 50) {
      return d3
        .scaleBand()
        .domain(list)
        .range([0, 15 * list.length]);
    }

    return d3.scaleBand().domain(list).range([0, height]);
  }, [featureToSort?.id, fid2weight, people, sortByStatus]);

  const stackedColorScale = useMemo(
    () =>
      d3
        .scaleOrdinal()
        .domain(features.map((d: any) => d.id))
        .range(mainColors2),
    [features]
  );

  useEffect(() => {
    // 根据people设置默认的人的状态
    const peopleKeys = ['normalPeople', 'refusedPeople', 'recommendPeople'];

    const pid2status: { [k: string]: number } = {};

    peopleKeys.forEach((key, i) => {
      const peopleList = people[key];
      if (peopleList) {
        peopleList.forEach((p: any) => {
          pid2status[p.id] = i;
        });
      }
    });

    setFigureStatusCb(pid2status);
  }, [people, setFigureStatusCb]);

  const sortedFeatures = useMemo(() => {
    if (featureToSort?.id) {
      return features
        .filter((d: any) => d.id === featureToSort.id)
        .map((d: any) => d.id);
    }
    return features.map((d: any) => d.id);
  }, [featureToSort?.id, features]);

  const {
    loading,
    posToS,
    yearToS,
    personToPerson,
    personInfo,
    nodeGroups,
  } = useSentence();

  const handleUpdate = useCallback(() => {
    dispatch(
      updateGroup({
        search_group: Object.keys(figureStatus)
          .filter((id) => figureStatus[id] !== 1)
          .map((d) => +d),
      })
    );
  }, [dispatch, figureStatus]);

  return (
    <div id="main-panel">
      <h2 className="g-title">Cohort Exploration</h2>

      <div className="op-container">
        <div id="feature-container">
          {features.map((f: any, i: number) => (
            <div className="item" key={f.id}>
              <span>{String.fromCharCode(i + BASE_CODE)}</span>
              <span className="rect" style={{ background: mainColors2[i] }} />
              <span>
                {f.descriptorsArr
                  .map((d: any) => `${d.type.slice(0, 1)}(${d.text})`)
                  .join(' & ')}
              </span>
            </div>
          ))}
        </div>
        <Button text="Update" onClick={handleUpdate} />
      </div>

      <div className="feature-content">
        <div className="feature-content-left">
          <h3 className="g-title">Cohort Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SortICON
              onClick={() => setSortByStatus(!sortByStatus)}
              style={{
                cursor: 'pointer',
                transform: sortByStatus ? 'inherit' : 'rotate(180deg)',
              }}
            />
            <Select
              style={{ width: 220, marginLeft: '5px' }}
              placeholder="Feature number"
              optionFilterProp="children"
              size="small"
              value={getDisplayedFeatureText(featureToSort)}
              onChange={onChange}
            >
              <Option value="">Feature Number</Option>

              {features.map((feature: any, index: number) => (
                <Option key={feature.id} value={index}>
                  {getDisplayedFeatureText(feature)}
                </Option>
              ))}
            </Select>
          </div>

          <FeatureList
            loading={loading}
            data={fid2weight}
            yScale={yScale}
            xScale={xScale}
            colorScale={stackedColorScale}
            groups={sortedFeatures}
            figureStatus={figureStatus}
          />
        </div>
        <div className="feature-content-right">
          <div className="feature-content-right-top">
            <div className="feature-content-headers">
              <h3 className="g-title">Figure Feature Validation</h3>
              <h3 className="g-title">Figure Event Validation</h3>
            </div>
            {!!figureIdSelected.length && (
              <FeatureView
                data={fid2weight}
                features={features}
                relationData={personToPerson}
                personInfo={personInfo}
                nodeGroups={nodeGroups}
              />
            )}
          </div>
        </div>
      </div>

      {element}
    </div>
  );
};

export default MainPanel;
