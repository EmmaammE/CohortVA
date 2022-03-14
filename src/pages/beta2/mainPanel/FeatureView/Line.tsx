import React, { useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import Apis from '../../../../api/apis';
import { post } from '../../../../api/tools';

interface ILine {
  // 排好序的personId
  pids: string[];
  rowHeight: number;
  setYearRange: Function;
}

interface IData {
  birth_year?: number;
  death_year?: number;
  c_year?: number;
  c_entry_type_desc?: string;
  birthplace?: string;
}

const width = 160;
const padding = 10;

const Line = ({ pids, rowHeight, setYearRange }: ILine) => {
  const [data, setData] = useState<{ [k: string]: IData }>({});
  useEffect(() => {
    const url = Apis.findPersonInfo;

    post({
      url,
      data: {
        person_ids: pids,
      },
    }).then((res) => {
      if (res.data.is_success) {
        setData(res.data.people_info);
      }
    });
  }, [pids]);

  const range = useMemo(() => {
    let minYear = 999999;
    let maxYear = 0;

    Object.values(data).forEach((item) => {
      if (item?.birth_year && minYear > item.birth_year) {
        minYear = item.birth_year;
      }

      if (item?.death_year && maxYear < item.death_year) {
        maxYear = item.death_year;
      }

      if (item?.c_year) {
        if (item.c_year < minYear) {
          minYear = item.c_year;
        } else if (item.c_year > maxYear) {
          maxYear = item.c_year;
        }
      }
    });

    setYearRange([minYear, maxYear]);
    return [minYear, maxYear];
  }, [data, setYearRange]);

  const xScale = useMemo(
    () => d3.scaleLinear().domain(range).range([0, width]).nice(),
    [range]
  );

  return (
    <svg
      width={width + padding * 2}
      height={rowHeight * pids.length}
      viewBox={`0 0 ${width + padding * 2} ${rowHeight * pids.length}`}
    >
      <g transform={`translate(${padding},0)`}>
        {Object.keys(data).map((fid, i) => (
          <>
            {data[fid]?.death_year && data[fid]?.death_year && (
              <rect
                key={fid}
                y={i * rowHeight + 5}
                x={xScale(data[fid]?.birth_year || range[0])}
                width={
                  xScale(data[fid]?.death_year || range[1]) -
                  xScale(data[fid]?.birth_year || range[0])
                }
                height={rowHeight - 10}
                fill="#fff"
                stroke="#ccc"
              />
            )}
            {!!data[fid]?.c_year && (
              <line
                x1={xScale(data[fid]?.c_year || 0)}
                x2={xScale(data[fid]?.c_year || 0)}
                y1={i * rowHeight}
                y2={i * rowHeight + rowHeight - 5}
                stroke="#B16653"
              />
            )}
          </>
        ))}
      </g>
    </svg>
  );
};

export default Line;
