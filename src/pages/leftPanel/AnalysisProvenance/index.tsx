import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getGroups, setGroupIndex } from '../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CohortFeature from './CohortFeature';
// import Collapsible from '../../../components/collapsible/Collapsible';
import Header from './Header';
import './index.scss';

interface IAnalysisProvenanceProps {
  setPath: (d: string) => void;
}

const AnalysisPanel = ({ setPath }: IAnalysisProvenanceProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(getGroups);
  const id2group = useAppSelector((state) => state.cohorts.id2group);

  const groupIndex = useAppSelector((state) => state.cohorts.groupIndex);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );

  const $clicked = useRef<any>(null);

  // 展开第几组群体
  const [activeIndex, setActiveIndex] = useState<number>(groupIndex);
  // 每组群体中在不展开时留下的群体
  const [activeCohortIndexArr, setActiveCohortIndex] = useState<number[]>([0]);

  useEffect(() => {
    if (activeCohortIndexArr[groupIndex] !== classifierIndex) {
      setActiveCohortIndex((prev) => {
        const newArr = [...prev];
        newArr[groupIndex] = classifierIndex;
        return newArr;
      });
    }
  }, [groupIndex, classifierIndex, activeCohortIndexArr]);

  const clickItem = useCallback(
    (e, i, j) => {
      // setActiveIndex(i);
      // setActiveCohortIndex([j]);
      dispatch(setGroupIndex([i, j]));
      setPath(e.currentTarget);

      // $clicked.current = e.currentTarget;
      // const bound = $clicked.current.getBoundingClientRect();
      // const y = bound.top - 40;
      // const x = bound.left + bound.width;
      // setPath(drawCurve([x, y]) as string);
    },
    [dispatch, setPath]
  );

  const expandItem = useCallback(
    (i) => {
      console.log('expandItem', i);
      if (activeIndex === i) {
        setActiveIndex(-1);
      } else {
        setActiveIndex(i);
      }
    },
    [activeIndex]
  );

  return (
    <div id="analysis-panel">
      {groups.map((groupId, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="cohort-item" key={i}>
          <Header
            open={activeIndex === i}
            index={i + 1}
            cnt={id2group[groupId].size}
            onClickMenu={() => expandItem(i)}
          />
          <div className="cohort-item-content">
            {id2group[groupId].atomFeature.map((feature: any, j: number) => {
              if (
                activeCohortIndexArr[i] === -1 ||
                activeIndex === i ||
                activeCohortIndexArr[i] === j
              ) {
                return (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={j}
                    className={`cohort-item-row ${
                      classifierIndex === j && groupIndex === i ? 'active' : ''
                    }`}
                    onClick={(e) =>
                      clickItem(e, i, id2group[groupId].classifiers[j].index)
                    }
                  >
                    <span className="menu">{j + 1}</span>
                    <span className="text">
                      {id2group[groupId].classifiers[j].pids.length}
                    </span>
                    <span className="svg-wrapper">
                      <CohortFeature features={feature} />
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisPanel;
