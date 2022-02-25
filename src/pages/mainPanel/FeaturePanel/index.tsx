/* eslint-disable camelcase */
/* eslint-disable no-shadow */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import FeatureRow from './FeatureRow/FeatureRow';
import './index.scss';
import Names, { width } from './Names';
import { RECT_HEIGHT } from './constant';
import AtomView from './AtomFeature';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { db, getNodeById } from '../../../database/db';
import { setFigureId } from '../../../reducer/statusSlice';

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
  const groupId = useAppSelector(getGroupId);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );
  const dispatch = useAppDispatch();

  const [features, setFeatures] = useState<any>([]);
  const [people, setPeople] = useState<any>({});
  const [maxFigureWeight, setMaxFigureWeight] = useState<number>(0);
  const [fid2weight, setFid2Weight] = useState<any>({});
  const [featureIdToSort, setFeatureIdToSort] = useState<string>('');

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
      setFeatureIdToSort(features?.[0]?.id || '');
    }

    load();
  }, [classifierIndex, groupId]);

  const atomFeature = useMemo(() => {
    const type2feature: any = {};
    (features || []).forEach((f: { descriptorsArr: any[] }) => {
      f.descriptorsArr.forEach((af: { text?: any; type?: any }) => {
        const { type } = af;
        if (!type2feature[type]) {
          type2feature[type] = [];
        }
        type2feature[type].push({
          ...af,
          text: af.text
            .replace(/[()]/g, '')
            .replace(/"+/g, '')
            .replace(/&+/g, ''),
        });
      });
    });

    return type2feature;
  }, [features]);

  // 根据选择的list和排序的复合特征id排序，返回当前显示的人
  const selectedPeople = useMemo(() => {
    const curPeople = (people || {})[selectedList] || [];

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

  const [interval, setInterval] = useState<IRange | null>(null);

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
      if (fid) {
        getNodeById(fid)
          .then((res) => {
            if (res) {
              const { name, en_name } = res;
              updateTip({
                left: x - 320,
                top: y - 50,
                content: `id:${fid}\n${name}\n${en_name}` || '',
              });
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        updateTip({
          left: 0,
          top: 0,
          content: '',
        });
      }
    },
    [updateTip]
  );

  const choseFigure = useCallback(
    (fid: string) => {
      dispatch(setFigureId(fid));
    },
    [dispatch]
  );

  return (
    <>
      <div id="feature-view">
        <div className="content g-scroll">
          {(features || []).map((feature: { id: string }) => (
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
              choseFigure={choseFigure}
            />
          ))}
        </div>
        <div className="x-container">
          <span>{selectedPeople.length ? 1 : ''}</span>
          <Names
            interval={interval}
            xScale={xScale2}
            setInterval={setInterval}
            selectedPeopleSize={selectedPeople.length}
            selectedNames={selectedNames}
            choseFigure={choseFigure}
          />
          <span>{!!selectedPeople.length && selectedPeople.length}</span>
        </div>
      </div>
      <h3 className="g-title">Atomic Feature View</h3>
      <AtomView data={atomFeature} />
    </>
  );
};

export default FeaturePanel;
