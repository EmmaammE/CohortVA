import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { db, IData } from '../../../../database/db';
import {
  fetchCohortByRegexAsync,
  getGroupId,
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
  const dispatch = useAppDispatch();
  const [data, setData] = useState<IData | null>(null);

  const { nodes, links, scale } = useForceGraph(data?.cf2cf_pmi || null);

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
      clickedFeature.slice(-2);
      setClickedFeature([...clickedFeature]);
    },
    [clickedFeature]
  );

  const replaceF1WithF2 = useCallback(
    (f1, f2) => {
      const cfidsArr: string[] = [];
      cfids.forEach((cfid) => {
        if (cfid !== f1) {
          cfidsArr.push(cfid);
        } else {
          cfidsArr.push(f2);
        }
      });

      console.log(cfidsArr);

      // 调用接口
      db.features
        .bulkGet(cfidsArr)
        .then((featuresParam) => {
          const param = {
            use_weight: true,
            features: featuresParam.reduce(
              (acc, cur) => ({
                ...acc,
                // [cur?.id || '']: { ...cur, id: +(cur as any).id },
                [cur?.id || '']: { ...cur },
              }),
              {}
            ),
          };

          dispatch(fetchCohortByRegexAsync(param));
        })
        .catch((e) => console.log(e));
    },
    [cfids, dispatch]
  );
  const handleReplace = useCallback(() => {
    if (clickedFeature.length === 2) {
      console.log(clickedFeature);
      const [f1, f2] = clickedFeature;
      if (cfids.has(f1)) {
        // 替换掉f1
        replaceF1WithF2(f1, f2);
      } else {
        replaceF1WithF2(f2, f1);
      }
    }
  }, [cfids, clickedFeature, replaceF1WithF2]);
  return (
    <div className={style.container}>
      <div className={style['svg-wrapper']}>
        <div className={style['replace-btn']} onClick={handleReplace}>
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
                      style={
                        cfids.has(node.id)
                          ? {
                              filter: 'url(#color-shadow)',
                            }
                          : {}
                      }
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
                  {value.features.map((d) => `${d.type}(${d.text})`).join('&')}
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
