import React, { useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { getGroups, setGroupIndex } from '../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CohortFeature from './CohortFeature';
// import Collapsible from '../../../components/collapsible/Collapsible';
import Header from './Header';
import './index.scss';
import { db } from '../../../database/db';

interface IAnalysisProvenanceProps {
  setPath: (d: string) => void;
}

type TPos = [number, number];

const x2 = 331;
const y2 = 334;

const lineFunction = (points: [number[], number[]]): string => {
  const start = points[0];
  const end = points[1];

  const control1 = [start[0] + (end[0] - start[0]) / 3, start[1]];
  const control2 = [end[0] - (end[0] - start[0]) / 3, end[1]];

  const dStr = `M${start[0]} ${start[1]}C${control1[0]} ${control1[1]},${control2[0]} ${control2[1]},${end[0]} ${end[1]}`;

  return dStr;
};

const drawCurve = ([x, y]: TPos) =>
  lineFunction([
    [x, y],
    [x2, y2],
  ]);

const AnalysisPanel = ({ setPath }: IAnalysisProvenanceProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(getGroups);
  const id2group = useAppSelector((state) => state.cohorts.id2group);
  // 第几组群体
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // 每组群体中选择的群体编号
  const [activeCohortIndexArr, setActiveCohortIndex] = useState<number[]>([0]);
  const groupIndex = useAppSelector((state) => state.cohorts.groupIndex);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );

  const clickItem = useCallback(
    (e, i, j) => {
      // setActiveIndex(i);
      // setActiveCohortIndex([j]);
      dispatch(setGroupIndex([i, j]));

      const target = e.target as HTMLElement;
      const y = target.offsetTop + target.offsetHeight / 2;
      const x = 290;

      setPath(drawCurve([x, y]) as string);
    },
    [dispatch, setPath]
  );

  return (
    <div id="analysis-panel">
      {groups.map((groupId, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="cohort-item" key={i}>
          <Header
            open={groupIndex === i}
            index={i + 1}
            cnt={id2group[groupId].size}
          />
          <div className="cohort-item-content">
            {id2group[groupId].atomFeature.map((feature: any, j: number) => (
              <div
                className={`cohort-item-row ${
                  classifierIndex === j && groupIndex === i ? 'active' : ''
                }`}
                onClick={(e) => clickItem(e, i, j)}
              >
                <span className="menu">{j + 1}</span>
                <span className="text">
                  {id2group[groupId].classifiers[j].normal_pids.length}
                </span>
                <span className="svg-wrapper">
                  <CohortFeature features={feature} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisPanel;
