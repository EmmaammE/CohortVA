// 使用新版sentence
/* eslint-disable no-shadow */
import { useEffect, useMemo, useState } from 'react';
import { getEventsByPeople } from '../../../api';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';

type TDescriptions = IData['descriptions'];

interface TData {
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
    [pid: string]: {
      [pid: string]: [{ sentence: string; type: string }];
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

  useEffect(() => {
    const personIds = new Set(pids);

    const posToS: any = {};
    const yearToS: any = {};
    setLoading(true);

    getEventsByPeople(pids).then(async (res) => {
      const data = res.data as TData;
      const { id2edge, id2node, id2sentence, main_data } = data;

      Object.keys(id2sentence).forEach((sid) => {
        const sentence = id2sentence[sid];
        const { words } = sentence;

        let addrFlag = false;
        let yearFlag = false;
        // 整理出句子中含有地点/年份的词
        for (let i = 0; i < words.length; i += 1) {
          const wordId = words[i];
          const { label } = id2node[wordId];

          switch (label) {
            case 'Addr':
              if (!addrFlag) {
                if (!posToS[wordId]) {
                  posToS[wordId] = [];
                }
                posToS[wordId].push(sentence);
                addrFlag = true;
              }
              break;
            case 'Year':
              // eslint-disable-next-line no-case-declarations
              const year = id2node[wordId].en_name;
              if (!yearFlag && year !== '0' && year !== 'None') {
                if (!yearToS[year]) {
                  yearToS[year] = [];
                }
                yearToS[year].push(sentence);
                yearFlag = true;
              }
              break;
            default:
              break;
          }
        }
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
      setPersonToPerson(main_data);
      setPosToS(posToS);
      setYearToS(yearToS);
    });
  }, [pids]);

  return {
    loading,
    posToS,
    yearToS,
    personToPerson,
  };
};

export default useSentence;
