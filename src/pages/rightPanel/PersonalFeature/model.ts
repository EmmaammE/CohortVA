import { getFeatureByName } from '../../../api';
import { descriptions } from '../../mainPanel/FeaturePanel/features';

// eslint-disable-next-line import/prefer-default-export
export const fetchPersonalFeature = (name: string) =>
  new Promise((resolve) => {
    getFeatureByName({
      search_group: [name],
    }).then((res) => {
      resolve({
        descriptions: descriptions(res.data),
        cf2cf_pmi: res.data.main_data.cf2cf_pmi,
      });
    });
  });
