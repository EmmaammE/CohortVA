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

export const getFeatureText = (descriptorsArr) => descriptorsArr.map(d => `${d.type}(${d.text})`).join(' ')

// 偷懒了，直接复制了之前的代码，这里只用来更新
export const handleFeatureData = (data, cf2cf_pmi, cfDict) => {
  const {id2composite_features, id2model_descriptor,id2node,main_data} = data;
  const {cf2weight} = main_data;
  const features = Object.keys(id2composite_features);
  return Object.keys(id2composite_features).map((cfid) => {
    const { proportion, model_descriptors } = id2composite_features[cfid];

    const descriptorsArr = [];
    model_descriptors.forEach((descriptorId) => {
      const model_descriptor = id2model_descriptor[descriptorId];
      const { parms, type } = model_descriptor;
      let descript = '';

      Object.keys(parms).forEach(key => {
        if (Array.isArray(parms[key])) {
          parms[key].forEach((d, i) => {
            if (i === 0) {
              descript += id2node[d].en_name;
            } else {
              descript += `, ${id2node[d].en_name}`;
            }
          });
        } else {
          descript += id2node[parms[key]].en_name;
        }
      })
     
      descriptorsArr.push({
        id: descriptorId,
        text: `"${descript}"`,
        type: modelName2Topic[type],
      });
    });

    const distanceArray = Object.keys(cf2cf_pmi[cfid])
      .filter((targetId) => features.indexOf(targetId) === -1)
      .map((d) => ({ id: d, dis: cf2cf_pmi[cfid][d] }));
    distanceArray.sort((a, b) => b.dis - a.dis);

    // 处理redundancy feature的model descriptors
    const redundancyFeatures = distanceArray.slice(0, 2).map((disObject) => {

      // 这里用的是之前已经存在数据库里的信息

      // eslint-disable-next-line no-shadow 
      const { proportion, model_descriptors } = cfDict[
        disObject.id
      ];
      const redundancyDescriptorArr = [];
      model_descriptors.forEach((model_descriptor, i) => {
        const { parms, type } = model_descriptor;
        let descript = '';
        Object.keys(parms).forEach(key => {
          if (Array.isArray(parms[key])) {
            // eslint-disable-next-line no-shadow
            parms[key].forEach((d, i) => {
              if (i === 0) {
                descript += id2node[d].en_name;
              } else {
                descript += `, ${id2node[d].en_name}`;
              }
            });
          } else {
            descript += id2node[parms[key]]?.en_name;
          }
        })
       
        let text = `("${descript}")&`;
        if (i === model_descriptors.length - 1) {
          text = text.slice(0, -1);
        }
        redundancyDescriptorArr.push({
          text,
          id: model_descriptor.id,
          type: modelName2Topic[type],
        });
      });
      return {
        id: disObject.id,
        descriptorsArr: redundancyDescriptorArr,
        proportion,
      };
    });

    return {
      id: cfid,
      proportion,
      descriptorsArr, // 原子特征
      subFeatures: [], // 子特征最多展示两个
      redundancyFeatures,
      weight: cf2weight[cfid],
    };
  });
}