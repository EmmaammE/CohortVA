import React, { useEffect, useMemo, useState } from 'react';
import Apis from '../../../../api/apis';
import { post } from '../../../../api/tools';

export interface IData {
  birth_year?: number;
  death_year?: number;
  c_year?: number;
  c_entry_type_desc?: string;
  birthplace?: string;
}

const useYearData = (pids: string[]) => {
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

    return [minYear, maxYear];
  }, [data]);

  return {
    data,
    range,
  };
};

export default useYearData;
