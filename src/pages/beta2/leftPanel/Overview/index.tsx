import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { db, IData, IFeature } from '../../../../database/db';
import {
  getGroupId,
  updateCohortByRegexAsync,
} from '../../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import useForceGraph, { HEIGHT, WIDTH } from './useForceGraph';
import style from './index.module.scss';
import FeatureNode from '../components/FeatureNode';

interface IOverview {
  show: boolean;
}
const Overview = ({ show }: IOverview) => {
  const groupId = useAppSelector(getGroupId);
  const cfids = useAppSelector((state) => new Set(state.status.cfids));
  const linkSetArr = useAppSelector((state) => state.feature.links);
  const featureId = useAppSelector((state) => state.feature.featureId);
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const dispatch = useAppDispatch();
  const [data, setData] = useState<IData | null>(null);

  const { nodes, links, scale } = useForceGraph(
    data?.cf2cf_pmi || null,
    data?.descriptions
  );

  const featureLink = useMemo(() => {
    const linkSet = new Set(linkSetArr);
    // 将主特征和其冗余特征连接在一起
    return links.filter((link) =>
      linkSet.has(`${link.source?.id}_${link.target?.id}`)
    );
  }, [linkSetArr, links]);

  const [sortedIndex, setSortedIndex] = useState<number>(0);
  const keys = useMemo(() => {
    const curKeys = Object.keys(data?.descriptions || {});

    if (sortedIndex === 0) {
      curKeys.sort(
        (k1, k2) =>
          (data?.descriptions?.[k2]?.proportion || 0) -
          (data?.descriptions?.[k1]?.proportion || 0)
      );
    } else if (sortedIndex === 1) {
      curKeys.sort(
        (k1, k2) =>
          (data?.descriptions?.[k2]?.weight || 0) -
          (data?.descriptions?.[k1]?.weight || 0)
      );
    }
    return curKeys;
  }, [data?.descriptions, sortedIndex]);

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      if (groupData) {
        setData(groupData);
      }
    }

    load();
  }, [groupId]);

  const weightScale = useMemo(() => {
    if (data?.descriptions) {
      // console.log(
      //   d3.extent(Object.values(data.descriptions).map((d) => d.weight)) as any
      // );
      return d3
        .scaleLinear()
        .range([1, 5])
        .domain(
          d3.extent(
            Object.values(data.descriptions).map((d) => d.weight)
          ) as any
        );
    }

    return null;
  }, [data?.descriptions]);

  // 点击两个特征，替换下来
  const [clickedFeature, setClickedFeature] = useState<string[]>([]);
  const handleClick = useCallback(
    (id) => {
      clickedFeature.push(id);
      setClickedFeature(clickedFeature.slice(-2));
    },
    [clickedFeature]
  );

  const canReplace = useMemo(() => {
    if (Object.keys(figureStatus).length && clickedFeature.length === 2) {
      const [f1, f2] = clickedFeature;
      if (
        (cfids.has(f1) && !cfids.has(f2)) ||
        (cfids.has(f2) && !cfids.has(f1))
      ) {
        return true;
      }
    }

    return false;
  }, [cfids, clickedFeature, figureStatus]);

  const replaceF1WithF2 = useCallback(
    (f1, f2) => {
      const cfidsArr: string[] = [f2, ...Array.from(cfids)];

      // 调用接口
      db.features
        .bulkGet(cfidsArr)
        .then((featuresParam) => {
          let weight = 0;
          const featuresMap: { [key: string]: IFeature } = {};
          featuresParam.forEach((f) => {
            if (f1 !== f?.id && f?.id) {
              featuresMap[f.id] = f;
            } else if (f?.id === f1) {
              weight = f?.weight || 0.1;
            }
          });
          featuresMap[f2].weight = weight;

          const param = {
            use_weight: false,
            features: featuresMap,
            search_group: Object.keys(figureStatus).filter(
              (d) => figureStatus[d] !== 2
            ),
          };

          dispatch(updateCohortByRegexAsync(param));
          setClickedFeature([]);
        })
        .catch((e) => console.log(e));
    },
    [cfids, dispatch, figureStatus]
  );
  const handleReplace = useCallback(() => {
    if (clickedFeature.length === 2) {
      const [f1, f2] = clickedFeature;
      if (cfids.has(f1)) {
        // 替换掉f1
        replaceF1WithF2(f1, f2);
      } else {
        replaceF1WithF2(f2, f1);
      }
    }
  }, [cfids, clickedFeature, replaceF1WithF2]);

  const featureStyle = useCallback(
    (id) => {
      const clickedFeatureSet = new Set(clickedFeature);
      if (clickedFeatureSet.has(id)) {
        return {
          filter: 'url(#select-shadow)',
        };
      }

      if (cfids.has(id)) {
        return {
          filter: 'url(#color-shadow)',
        };
      }

      return {};
    },
    [cfids, clickedFeature]
  );

  return (
    <div className={style.container}>
      <div className={style['svg-wrapper']}>
        <div
          className={style['replace-btn']}
          onClick={handleReplace}
          style={canReplace ? { cursor: 'pointer' } : { cursor: 'not-allowed' }}
        >
          replace
        </div>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={show ? { width: '50%' } : {}}
        >
          <defs>
            <filter id="color-shadow">
              <feMorphology
                in="SourceAlpha"
                result="expanded"
                operator="dilate"
                radius="0.1"
              />
              <feFlood floodColor="#ccc" />
              <feComposite in="SourceGraphic" />
            </filter>

            <filter id="select-shadow">
              <feMorphology
                in="SourceAlpha"
                result="expanded"
                operator="dilate"
                radius="0.1"
              />
              <feFlood floodColor="#D4E1E3" />
              <feComposite in="SourceGraphic" />
            </filter>
          </defs>
          {featureLink.map((link: any) => (
            <line
              key={link.index}
              x1={scale(link.source?.x) + 6}
              y1={scale(link.source?.y) + 6}
              x2={scale(link.target?.x) + 6}
              y2={scale(link.target?.y) + 6}
              strokeWidth={
                featureId === link.source.id || featureId === link.source.id
                  ? 2
                  : 1
              }
              stroke="#979797"
              strokeDasharray="2 2"
              opacity={
                featureId === '' ||
                featureId === link.source.id ||
                featureId === link.source.id
                  ? 1
                  : 0.2
              }
            />
          ))}
          <g>
            {data?.descriptions &&
              nodes.map(
                (node: any) =>
                  node.x &&
                  node.y && (
                    <FeatureNode
                      key={node.id}
                      x={scale(node.x)}
                      y={scale(node.y)}
                      size={
                        weightScale
                          ? weightScale(data.descriptions?.[node.id]?.weight)
                          : 0
                      }
                      id={node.id}
                      data={data.descriptions?.[node.id]?.features || []}
                      showTip
                      style={featureStyle(node.id)}
                      onClick={() => handleClick(node.id)}
                    />
                  )
              )}
          </g>
        </svg>
      </div>
      <div className={style.btns}>
        <div
          style={sortedIndex === 0 ? { background: '#efefef' } : {}}
          onClick={() => setSortedIndex(0)}
        >
          Figure Count
        </div>
        <div
          style={sortedIndex === 1 ? { background: '#efefef' } : {}}
          onClick={() => setSortedIndex(1)}
        >
          Feature Weight
        </div>
      </div>
      <div className={[style.list, 'g-scroll'].join(' ')}>
        {keys.map((cfid) => {
          const value = data?.descriptions?.[cfid] || null;
          if (value) {
            return (
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              <div className={style.item} key={cfid}>
                <span>
                  <svg width="15px" height="15px" viewBox="0 0 12 12">
                    <FeatureNode
                      key={`${cfid}-list`}
                      data={value.features}
                      id={cfid}
                    />
                  </svg>
                </span>
                <p>
                  {value.features
                    .map((d) => `${d.type.slice(0, 1)}(${d.text})`)
                    .join('&')}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Overview;
