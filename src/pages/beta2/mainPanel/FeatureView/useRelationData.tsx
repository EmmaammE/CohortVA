import React, { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import eventMap, { TEventType } from '../../../../utils/eventMap';

type TRelationData = {
  [key: string]: {
    [key: string]: { sentence: string; type: TEventType }[];
  };
};

type TMatrixData = {
  source: number;
  target: number;
  x: number;
  y: number;
  color: any;
  opacity: any;
}[];

const useRelationData = (
  sortedFigureIds: string[],
  relationData: TRelationData
) => {
  const [matrixData, setMatrixData] = useState<TMatrixData>([]);
  const [relationInfo, setRelationInfo] = useState<
    { key: TEventType; value: number }[]
  >([]);

  useEffect(() => {
    const matrix = [];
    const n = sortedFigureIds.length;

    // 每种事件类型的总数
    const type2sum: { [key in TEventType]?: number } = {};
    let maxCnt = 0;
    for (let i = 0; i < n; i += 1) {
      for (let j = i; j < n; j += 1) {
        const data =
          relationData?.[sortedFigureIds[i]]?.[sortedFigureIds[j]] || [];
        const cnt = data.length;

        // 统计两个人之间数量最多的事件类型
        const type2cnt: { [k: string]: number } = {};
        data.forEach((d) => {
          type2cnt[d.type] = (type2cnt[d.type] || 0) + 1;
          type2sum[d.type] = (type2sum[d.type] || 0) + 1;
        });
        let gridMaxCnt = 0;
        let gridMaxType: string = '';
        Object.keys(type2cnt).forEach((type) => {
          if (type2cnt[type] > gridMaxCnt) {
            gridMaxCnt = type2cnt[type];
            gridMaxType = type;
          }
        });

        if (cnt > 0) {
          matrix.push({
            source: i,
            target: j,
            x: j - i,
            y: i + 1 / 2 + j,
            color: eventMap?.[gridMaxType as TEventType]?.color || '#000',
            opacity: cnt,
            type: gridMaxType,
          });

          if (cnt > maxCnt) {
            maxCnt = cnt;
          }
        }
      }
    }

    console.log(maxCnt);

    const opacityScale = d3.scaleLinear().domain([0, maxCnt]).range([0.5, 1]);

    matrix.forEach((item) => {
      item.opacity = opacityScale(item.opacity);
    });

    setMatrixData(matrix);
    setRelationInfo(
      Object.keys(type2sum).map((d) => ({
        key: d as TEventType,
        value: type2sum[d as TEventType] || 0,
      }))
    );
  }, [relationData, sortedFigureIds]);

  const linesData = useMemo(() => {
    const matrix = [];
    const n = sortedFigureIds.length;

    for (let i = 0; i < n + 1; i += 1) {
      matrix.push({
        pos: [
          [0, 2 * n - (i + i) - 1 / 2],
          [n - i, 2 * n - (i + n) - 1 / 2],
        ],
        target: n - i,
      });

      matrix.push({
        pos: [
          [0, i + i - 1 / 2],
          [n - i, i + n - 1 / 2],
        ],
        source: i,
      });
    }
    return matrix;
  }, [sortedFigureIds.length]);

  const { rangeX, rangeY } = useMemo(
    () => ({
      rangeX: [0, sortedFigureIds.length - 1],
      rangeY: [0.5, sortedFigureIds.length * 2 + 1 / 2 - 2],
    }),
    [sortedFigureIds.length]
  );

  return {
    matrixData,
    linesData,
    rangeX,
    rangeY,
    relationInfo,
  };
};

export default useRelationData;
