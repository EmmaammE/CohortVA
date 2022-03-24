/* eslint-disable */
import { modelName2Topic } from '../../../utils/atomTopic';

const handleFeatureData = (data, chosenClassifier) => {
  const {
    main_data,
    id2composite_features,
    id2model_descriptor,
    id2node,
  } = data;
  const { classifiers, cf2cf_pmi } = main_data;
  if (!classifiers.length) {
    return [];
  }
  const { cf2weight } = classifiers[chosenClassifier];

  const displayed_features = Object.keys(cf2weight);

  return displayed_features.map((cfid) => {
    const { proportion, model_descriptors } = id2composite_features[cfid];

    // 获取每个cf的子特征
    // 对于连线的每一个点，找跟其余所有点的差集
    const subFeatures = [];
    // for (const cfid in id2composite_features) {
    //   const targetDescriptors = id2composite_features[cfid].model_descriptors;
    //   // 找差集
    //   let index = 0;
    //   while (
    //     index < model_descriptors.length &&
    //     index < targetDescriptors.length &&
    //     model_descriptors[index] === targetDescriptors[index]
    //   ) {
    //     index++;
    //   }
    //   // 符合条件，去找子feature的描述和propotion
    //   if (
    //     index >= model_descriptors.length &&
    //     index < targetDescriptors.length
    //   ) {
    //     // 子feature包含的descriptors,可能有多个
    //     const subFeatureDescriptors = targetDescriptors.slice(index);
    //     const subDescriptorArr = []; // 子特征的描述分段存储，可以点击
    //     subFeatureDescriptors.forEach((descriptorId, i) => {
    //       const model_descriptor = id2model_descriptor[descriptorId];
    //       const { parms, type } = model_descriptor;
    //       let descript = '';
    //       for (const key in parms) {
    //         if (Array.isArray(parms[key])) {
    //           parms[key].forEach((d, i) => {
    //             if (i === 0) {
    //               descript += id2node[d].en_name;
    //             } else {
    //               descript += `, ${id2node[d].en_name}`;
    //             }
    //           });
    //         } else {
    //           descript = id2node[parms[key]].en_name;
    //         }
    //       }
    //       let text = `("${descript}")&`;
    //       if (i === subFeatureDescriptors.length - 1) {
    //         text = text.slice(0, -1);
    //       }
    //       subDescriptorArr.push({
    //         text,
    //         id: descriptorId,
    //         type: modelName2Topic[type],
    //       });
    //     });
    //     subFeatures.push({
    //       ids: subFeatureDescriptors,
    //       descriptorsArr: subDescriptorArr,
    //       proportion:
    //         id2model_descriptor[
    //           subFeatureDescriptors[subFeatureDescriptors.length - 1]
    //         ].proportion,
    //     });

    //     // 如果用减数作子特征，相当于在目前的特征上，再提取了一层。
    //     // 这种子特征具体的意义是什么？
    //     // subFeatures.push(id2composite_features[cfid])
    //   }
    // }
    // // 按proportion排序，取最大的两个
    // subFeatures.sort((a, b) => b.proportion - a.proportion);

    const descriptorsArr = [];
    model_descriptors.forEach((descriptorId, i) => {
      const model_descriptor = id2model_descriptor[descriptorId];
      const { parms, type } = model_descriptor;
      let descript = '';
      for (const key in parms) {
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
      }
      descriptorsArr.push({
        id: descriptorId,
        text: `"${descript}"`,
        type: modelName2Topic[type],
      });
    });

    const distanceArray = Object.keys(cf2cf_pmi[cfid])
      .filter((targetId) => displayed_features.indexOf(targetId) === -1)
      .map((d) => ({ id: d, dis: cf2cf_pmi[cfid][d] }));
    distanceArray.sort((a, b) => b.dis - a.dis);

    // 处理redundancy feature的model descriptors
    const redundancyFeatures = distanceArray.slice(0, 2).map((disObject) => {
      const { proportion, model_descriptors } = id2composite_features[
        disObject.id
      ];
      const redundancyDescriptorArr = [];
      model_descriptors.forEach((descriptorId, i) => {
        const model_descriptor = id2model_descriptor[descriptorId];
        const { parms, type } = model_descriptor;
        let descript = '';
        for (const key in parms) {
          if (Array.isArray(parms[key])) {
            parms[key].forEach((d, i) => {
              if (i === 0) {
                descript += id2node[d].en_name;
              } else {
                descript += `, ${id2node[d].en_name}`;
              }
            });
          } else {
            descript = id2node[parms[key]].en_name;
          }
        }
        let text = `("${descript}")&`;
        if (i === model_descriptors.length - 1) {
          text = text.slice(0, -1);
        }
        redundancyDescriptorArr.push({
          text,
          id: descriptorId,
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
      subFeatures: subFeatures.slice(0, 2), // 子特征最多展示两个
      redundancyFeatures,
      weight: cf2weight[cfid],
    };
  });
};

export const getPeople = (data, chosenClassifier) => {
  const { main_data } = data;
  const { classifiers } = main_data;
  if (!classifiers[chosenClassifier]) {
    return {
      normalPeople: [],
      recommendPeople: [],
      refusedPeople: [],
    };
  }

  return {
    normalPeople: classifiers[chosenClassifier].normal_pids,
    recommendPeople: classifiers[chosenClassifier].recommend_pids,
    refusedPeople: classifiers[chosenClassifier].refused_pids,
  };
};

export default handleFeatureData;

const getRectHeightScaleAndWeightMap = (figure2FeatureWeight, pids) => {
  const weightsumMap = {}; // 存每个人weightsum的计数
  let maxWeightSum = 0;
  console.log(figure2FeatureWeight);
  // Object.keys(figure2FeatureWeight).forEach(key => {
  // 矩形块按权重排下序
  // figure2FeatureWeight[key].sort((a, b) => a.weight-b.weight);
  pids.forEach((key) => {
    if (figure2FeatureWeight.hasOwnProperty(key)) {
      const weightSum = figure2FeatureWeight[key]
        .map((d) => d.weight)
        .reduce((pre, cur) => pre + cur, 0);
      if (weightSum in weightsumMap) {
        weightsumMap[weightSum]++;
      } else {
        weightsumMap[weightSum] = 0;
      }
      if (weightSum > maxWeightSum) maxWeightSum = weightSum;
    }
  });
  console.log(weightsumMap);

  // const rectHeightScale = d3.scaleLinear()
  //   .domain([0, maxWeightSum])
  //   .range([0, 100]) // 100
  return [maxWeightSum, weightsumMap];
};

// 从extractedFeatures中提取人的特征
export const getFigure2Feature = (data, chosenClassifier) => {
  const { main_data } = data;
  const { classifiers } = main_data;
  const {
    fid2weight,
  } = classifiers[chosenClassifier];


  const maxFigureWeight = Math.max(...Object.values(fid2weight).map(d => d.sum))

  return {
    maxFigureWeight,
    fid2weight: fid2weight
  };
};

export const descriptions = (data) => {
  const {
    main_data,
    id2composite_features,
    id2model_descriptor,
    id2node
  } = data;
  const { cf2pmi } = main_data;
  const res = {};

  Object.keys(cf2pmi).forEach((cfid) => {
    const { model_descriptors, proportion } = id2composite_features[cfid];
    
    res[cfid] = {
      weight: cf2pmi[cfid], 
      proportion,
      features: model_descriptors.map((descriptorId, i) => {
        const model_descriptor = id2model_descriptor[descriptorId];
        const { type, parms } = model_descriptor;

        const descript = Object.keys(parms).map((key) => {
          if (Array.isArray(parms[key])) {
            return parms[key].map((d) => id2node[d].en_name).join(', ');
          } else {
            return id2node[parms[key]].en_name;
          }
        })

        return ({
          type: modelName2Topic[type],
          text: descript,
        })
      }),
      // 复合特征的sentence就是从最后一个原子特征模型提取出来的句子
      sentence: id2model_descriptor[model_descriptors[model_descriptors.length - 1]].sentences,
    }
  });

  return res;
}

export const processData = (data) => {
  const { main_data } = data;
  const { classifiers, } = main_data;
 
  return classifiers.map((classifiler, chosenClassifier) => {
    return {
      id: main_data.groups[0],
      index: chosenClassifier,
      value: {
        features: handleFeatureData(data, chosenClassifier),
        people: getPeople(data, chosenClassifier),
        pid2allcfvalue: classifiler.pid2allcfvalue,
        ...getFigure2Feature(data, chosenClassifier),
      }
    }
  })
}