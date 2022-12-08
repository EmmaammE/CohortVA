/* eslint-disable no-shadow */
import { useEffect, useMemo, useState } from 'react';
import { db, IData } from '../../../database/db';
import { getGroupId } from '../../../reducer/cohortsSlice';
import { useAppSelector } from '../../../store/hooks';

type TDescriptions = IData['descriptions'];

// 返回当前特征组对应的句子
const useSentence = (features: any[], pids: string[]) => {
  const groupId = useAppSelector(getGroupId);
  const [data, setData] = useState<TDescriptions>({});
  const [posToS, setPosToS] = useState<any>({});
  const [yearToS, setYearToS] = useState<any>({});
  const [personToPerson, setPersonToPerson] = useState<any>({});

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const groupData = await db.group.get({
        id: groupId,
      });
      setData(groupData?.descriptions || {});
    }

    load();
  }, [groupId]);

  const sentences = useMemo(
    () => features.map((f) => data[f.id]?.sentence || []).flat(),
    [data, features]
  );

  useEffect(() => {
    const personIds = new Set(pids);

    const posToS: any = {};
    const yearToS: any = {};
    const personToPerson: any = {};
    setLoading(true);

    db.sentence.bulkGet(sentences).then((sentenceRes) => {
      Promise.all(
        sentenceRes.map(async (sentence) => {
          const words = sentence?.words || [];
          const res = await db.node.bulkGet(words);

          const people = res
            .filter((word) => word?.label === 'Person')
            .map((word) => `${word?.id}` || '');
          people.forEach((p) => {
            people.forEach((q) => {
              if (p !== q && personIds.has(p) && personIds.has(q)) {
                personToPerson[p] = personToPerson[p] || {};
                personToPerson[p][q] = personToPerson[p][q] || [];
                personToPerson[p][q].push(sentence);
              }
            });
          });

          let addrFlag = false;
          let yearFlag = false;

          // console.log(res);
          // 整理出句子中含有地点/年份的词
          for (let i = 0; i < res.length; i += 1) {
            const word = res[i];
            const label = word?.label;
            const wordId = word?.id;

            if (wordId) {
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
                  const year = word?.en_name || '0';
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
          }
        })
      ).then(() => {
        setPosToS(posToS);
        setYearToS(yearToS);
        setPersonToPerson(personToPerson);
        setLoading(false);
      });
    });
  }, [data, pids, sentences]);

  return {
    loading,
    posToS,
    yearToS,
    personToPerson,
  };
};

export default useSentence;
