import { modelName2Topic } from "./atomTopic";

/* eslint-disable camelcase */
// eslint-disable-next-line import/prefer-default-export
export const getAtomFeature = (data) => {
  const {
    main_data,
    id2composite_features,
    id2model_descriptor,
  } = data;
  const { classifiers} = main_data;
  if (!classifiers.length) {
    return [];
  }

  return classifiers.map((classifier) => {
    const { cf2weight } = classifier;

    return Object.keys(cf2weight).map((cfid) => {
      const { model_descriptors, proportion } = id2composite_features[cfid];
  
      return {
        cnt:proportion,
        feature: model_descriptors.map((descriptorId, i) => {
          const model_descriptor = id2model_descriptor[descriptorId];
          const { type } = model_descriptor;
  
          return modelName2Topic[type]
        })
      }
    })
  })
};
