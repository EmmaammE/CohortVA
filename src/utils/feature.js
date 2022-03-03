import { modelName2Topic } from './atomTopic';

// eslint-disable-next-line import/prefer-default-export
export const getAtomFeature = (data) => {
  const { main_data, id2composite_features, id2model_descriptor } = data;
  const { classifiers } = main_data;
  if (!classifiers.length) {
    return [];
  }

  return classifiers.map((classifier) => {
    const { cf2weight } = classifier;

    return Object.keys(cf2weight).map((cfid) => {
      const { model_descriptors, proportion } = id2composite_features[cfid];

      return {
        cnt: proportion,
        feature: model_descriptors.map((descriptorId, i) => {
          const model_descriptor = id2model_descriptor[descriptorId];
          const { type } = model_descriptor;

          return modelName2Topic[type];
        }),
      };
    });
  });
};

// 处理sentence
export const preprocessData = (data) => {
  const { id2sentence, id2node, id2model_descriptor, id2group } = data;

  // posId -> sentenceId -> sentence
  const posToS = {};
  const yearToS = {};
  const personToPerson = {};

  // TODO 这里是整个群体的人，是否要按分类器分组？
  const personIds = new Set(Object.values(id2group)[0].pids);

  Object.keys(id2model_descriptor).forEach((modelDescriptorId) => {
    const { sentences } = id2model_descriptor[modelDescriptorId];
    sentences.forEach((sid) => {
      const sentence = id2sentence[sid];
      const { words } = sentence;

      // 找到句子中含的人
      const people = words.filter(wordId => id2node[wordId].label === 'Person');
      people.forEach(p => {
        people.forEach(q => {
          if (p !== q && personIds.has(p) && personIds.has(q)) {
            personToPerson[p] = personToPerson[p] || {};
            personToPerson[p][q] = personToPerson[p][q] || [];
            personToPerson[p][q].push(sentence)
          }
        })
      })

      let addrFlag = false;
      let yearFlag = false;
      // 整理出句子中含有地点/年份的词
      for(let i=0; i<words.length; i+=1) {
        const wordId = words[i];
        const {label} = id2node[wordId];

        switch(label) {
          case 'Addr':
            if(!addrFlag) {
              if(!posToS[wordId]) {
                posToS[wordId] = [];
              }
              posToS[wordId].push(sentence);
              addrFlag = true;
            }
            break;
          case 'Year':
            // eslint-disable-next-line no-case-declarations
            const year = id2node[wordId].en_name;
            if(!yearFlag && year!=='0' && year !=='None') {
              if(!yearToS[year]) {
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
  });

  return {
    posToS,
    yearToS,
    personToPerson
  }
};
