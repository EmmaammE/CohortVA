/* eslint-disable react/no-array-index-key */
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../../../../database/db';
import { getGroups, setGroupIndex } from '../../../../reducer/cohortsSlice';
import { setLinks } from '../../../../reducer/featureSlice';
import { setCfids, setFigureStatus } from '../../../../reducer/statusSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import FeatureNode from '../components/FeatureNode';
import ProportionBar from '../components/ProportionBar';
import CohortFeature from './CohortFeature';
import Header from './Header';
import './index.scss';

const AnalysisPanel = () => {
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

      // const linkSet = new Set<string>();
      // groupsMap[groups[i]]?.classifiers[j].features.forEach(
      //   ({ id, redundancyFeatures }: any) => {
      //     redundancyFeatures.forEach((rf: any) => {
      //       linkSet.add(`${id}_${rf.id}`);
      //     });
      //   }
      // );

      // dispatch(setLinks(Array.from(linkSet)));
    },
    [dispatch]
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

  // 是否是当前选中的特征组，也就是那个分类器
  const isExpandedFeatureGroup = useCallback(
    (i, j) => classifierIndex === j && groupIndex === i,
    [classifierIndex, groupIndex]
  );
  // 如果是探索过的特征组，收起来or进入下一步的时候，只展示当前这一个
  const isExplored = useCallback(
    (i, j) =>
      activeCohortIndexArr[i] === -1 ||
      activeIndex === i ||
      activeCohortIndexArr[i] === j,
    [activeCohortIndexArr, activeIndex]
  );
  return (
    <div id="analysis-panel" className="g-scroll">
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
              ({ features, pids }: any, j: number) =>
                isExpandedFeatureGroup(i, j) ? (
                  <CohortFeature
                    key={j}
                    j={j}
                    features={features}
                    size={pids}
                  />
                ) : (
                  isExplored(i, j) && (
                    <div
                      key={j}
                      className="cohort-item-row"
                      onClick={(e) => clickItem(e, i, j)}
                    >
                      <span className="menu">{j + 1}</span>
                      <span className="svg-wrapper">
                        {features.map((feature: any) => (
                          <svg
                            key={feature.id}
                            width="33px"
                            height="22px"
                            viewBox="0 0 21 14"
                          >
                            <ProportionBar proportion={feature.proportion} />
                            <FeatureNode
                              x={6}
                              y={0}
                              data={feature.descriptorsArr}
                              id={feature.id}
                              showTip
                            />
                          </svg>
                        ))}
                      </span>
                      <span className="text">{pids}</span>
                      <span className="right-menu" />
                    </div>
                  )
                )
            )}

            <div className="divider" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalysisPanel;
