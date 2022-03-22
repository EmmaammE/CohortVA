// 使用新版sentence
/* eslint-disable no-shadow */
import { useEffect, useMemo, useState } from 'react';
import { getEventsByPeople } from '../../../api';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';

type TDescriptions = IData['descriptions'];

type TSentence = { sentence: string; type: string }[];

export interface IInfoData {
  birth_year?: number;
  death_year?: number;
  c_year?: number;
  c_entry_type_desc?: string;
  birthplace?: string;
  office?: {
    c_firstyear: 0;
    c_office_chn: string;
    isUpgrade: boolean;
  }[];
  sentenceInfo?: {
    type: string[];
    cnt: number;
  };
  sentence?: { sentence: string; type: string; year: string }[];
}
interface IResData {
  id2edge: { [key: string]: { label: string } };
  id2node: {
    [key: string]: {
      label: string;
      name: string;
      en_name: string;
      id: number;
    };
  };
  id2sentence: {
    [key: string]: {
      id: string;
      words: string[];
      edges: string[];
      category: string;
    };
  };
  main_data: {
    eventHasAddr: {
      [key: string]: TSentence;
    };
    eventHasTime: {
      [key: string]: TSentence;
    };
    relationBtweenPeople: {
      [pid: string]: {
        [pid: string]: TSentence;
      };
    };
    people_info: { [k: string]: IInfoData };
    pid2allSentence: {
      [key: string]: TSentence;
    };
  };
}
// 返回当前特征组对应的句子
const useSentence = () => {
  const pids = useAppSelector((state) => state.status.figureIdArr);
  const [loading, setLoading] = useState<boolean>(false);

  const [posToS, setPosToS] = useState<any>({});
  const [yearToS, setYearToS] = useState<any>({});
  const [personToPerson, setPersonToPerson] = useState<any>({});
  const [personInfo, setPersonInfo] = useState<{ [k: string]: IInfoData }>({});

  useEffect(() => {
    setLoading(true);

    getEventsByPeople(pids).then(async (res) => {
      const data = res.data as IResData;
      const { id2edge, id2node, id2sentence, main_data } = data;
      const { people_info } = main_data;

      Object.keys(main_data.pid2allSentence || {}).forEach((pid) => {
        const sentence = main_data.pid2allSentence[pid];

        // 每个人有时间信息的句子
        people_info[pid].sentence = [];

        const type2cnt: { [k: string]: number } = {};
        sentence.forEach((d) => {
          type2cnt[d.type] = (type2cnt[d.type] || 0) + 1;

          //  找到这个sentence是否含有年份
          const { words } = id2sentence[d.sentence];

          let yearFlag = false;
          // 整理出句子中含有年份的词
          for (let i = 0; i < words.length; i += 1) {
            const wordId = words[i];
            const { label } = id2node[wordId];

            switch (label) {
              case 'Year':
                // eslint-disable-next-line no-case-declarations
                const year = id2node[wordId].en_name;
                if (!yearFlag && year !== '0' && year !== 'None') {
                  people_info[pid]?.sentence?.push({
                    ...d,
                    year,
                  });
                  yearFlag = true;
                }
                break;
              default:
                break;
            }
          }
        });

        const cntEntries = Object.entries(type2cnt).sort((a, b) => b[1] - a[1]);
        // 每个人数量最多的句子类型
        people_info[pid].sentenceInfo = {
          type: cntEntries.slice(0, 3).map((d) => d[0]),
          cnt: sentence.length,
        };
      });

      await db.node
        .bulkAdd(Object.values(id2node))
        .catch((e) => console.log(e));
      await db.node
        .bulkAdd(
          Object.keys(id2edge).map((key) => ({
            id: +key,
            label: id2edge[key].label,
          }))
        )
        .catch((e) => console.log(e));

      await db.sentence
        .bulkAdd(
          Object.keys(id2sentence).map((key) => ({
            ...id2sentence[key],
            id: key,
          }))
        )
        .catch((e) => console.log(e));

      setLoading(false);
      setPersonToPerson(main_data.relationBtweenPeople);
      setYearToS(main_data.eventHasTime);
      setPersonInfo(people_info);
      setPosToS(main_data.eventHasAddr);
    });
  }, [pids]);

  return {
    loading,
    posToS,
    yearToS,
    personToPerson,
    personInfo,
  };
};

export default useSentence;
