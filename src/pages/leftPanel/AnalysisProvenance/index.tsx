/* eslint-disable react/no-array-index-key */
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../../database/db';
import { getGroups, setGroupIndex } from '../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CohortFeature from './CohortFeature2';
// import Collapsible from '../../../components/collapsible/Collapsible';
import Header from './Header';
import './index.scss';

interface IAnalysisProvenanceProps {
  setPath: (d: string) => void;
}

const AnalysisPanel = ({ setPath }: IAnalysisProvenanceProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(getGroups);

  const groupsTable = useLiveQuery(() => db.cohorts.toArray());
  const groupsMap = useMemo(() => {
    const res: { [k: string]: any } = {};
    groupsTable?.forEach((item) => {
      const { id, index, value } = item;
      if (!res[id]) {
        res[id] = {};
        res[id].size =
          value.people.normalPeople.length + value.people.refusedPeople.length;

        res[id].classifiers = [];
      }
      res[id].classifiers[index] = {
        features: value.features,
        pids: value.people.normalPeople.length,
      };
    });

    return res;
  }, [groupsTable]);

  const groupIndex = useAppSelector((state) => state.cohorts.groupIndex);
  const classifierIndex = useAppSelector(
    (state) => state.cohorts.classifierIndex
  );

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
    },
    [dispatch, setPath]
  );

  const expandItem = useCallback(
    (i) => {
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
        <div className="cohort-item" key={i}>
          <Header
            open={activeIndex === i}
            index={i + 1}
            cnt={groupsMap[groupId]?.size || 0}
            onClickMenu={() => expandItem(i)}
          />
          <div className="cohort-item-content">
            {groupsMap[groupId]?.classifiers.map(
              ({ features, pids }: any, j: number) => {
                if (
                  activeCohortIndexArr[i] === -1 ||
                  activeIndex === i ||
                  activeCohortIndexArr[i] === j
                ) {
                  return (
                    <div
                      key={j}
                      className={`cohort-item-row ${
                        classifierIndex === j && groupIndex === i
                          ? 'active'
                          : ''
                      }`}
                      onClick={(e) => clickItem(e, i, j)}
                    >
                      <span className="menu">{j + 1}</span>
                      <span className="text">{pids}</span>
                      <span className="svg-wrapper">
                        <CohortFeature
                          features={features}
                          expand={classifierIndex === j && groupIndex === i}
                        />
                      </span>
                    </div>
                  );
                }
                return null;
              }
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisPanel;
