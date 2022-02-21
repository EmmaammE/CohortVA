import React, { useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { getGroups, setGroupIndex } from '../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CohortFeature from './CohortFeature';
// import Collapsible from '../../../components/collapsible/Collapsible';
import Header from './Header';
import './index.scss';

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
  // 第几组群体
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // 每组群体中选择的群体编号
  const [activeCohortIndexArr, setActiveCohortIndex] = useState<number[]>([0]);

  const clickItem = useCallback(
    (e, i, j) => {
      setActiveIndex(i);
      setActiveCohortIndex([j]);
      dispatch(setGroupIndex([i, j]));

      const target = e.target as HTMLElement;
      const y = target.offsetTop + target.offsetHeight / 2;
      const x = target.offsetLeft + target.offsetWidth;

      setPath(drawCurve([x, y]) as string);
    },
    [dispatch, setPath]
  );

  return (
    <div id="analysis-panel">
      {groups.map((groupId, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="cohort-item" key={i}>
          <Header open={activeIndex === i} index={i + 1} />
          <div className="cohort-item-content">
            {/* todo: multiple items */}
            <div
              className="cohort-item-row active"
              onClick={(e) => clickItem(e, i, 0)}
            >
              <span className="menu">1</span>
              <span className="text">200</span>
              <span className="svg-wrapper">
                <CohortFeature />
              </span>
            </div>
            <div className="cohort-item-row">
              <span className="menu">2</span>
              <span className="text">200</span>
              <span className="svg-wrapper">
                <CohortFeature />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisPanel;
