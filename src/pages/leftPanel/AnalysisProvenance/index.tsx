import React, { useMemo, useState } from 'react';
import { getGroups } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';
import CohortFeature from './CohortFeature';
// import Collapsible from '../../../components/collapsible/Collapsible';
import Header from './Header';
import './index.scss';

const AnalysisPanel = () => {
  const groups = useAppSelector(getGroups);
  // 第几组群体
  const [activeIndex, setActiveIndex] = useState<number>(0);
  // 每组群体中选择的群体编号
  const [activeCohortIndexArr, setActiveCohortIndex] = useState<number[]>([0]);

  console.log('groups', groups);
  return (
    <div id="analysis-panel">
      {groups.map((groupId, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="cohort-item" key={i}>
          <Header open={activeIndex === i} index={i + 1} />
          <div className="cohort-item-content">
            {/* todo: multiple items */}
            <div className="cohort-item-row active">
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
