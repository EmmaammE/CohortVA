import { getFeatureByName } from '../../../api';
import { descriptions } from '../../mainPanel/FeaturePanel/features';

// eslint-disable-next-line import/prefer-default-export
export const fetchPersonalFeature = (name: string) =>
  new Promise((resolve) => {
    getFeatureByName({
      search_group: [name],
    }).then((res) => {
      const des: any = descriptions(res.data);
      const { cf2pmi } = res.data.main_data;

      const keys = Object.keys(cf2pmi)
        .sort((a, b) => cf2pmi[a] - cf2pmi[b])
        .map((d: any) => des[d]);
      resolve({
        descriptions: keys,
        // cf2cf_pmi: res.data.main_data.cf2cf_pmi,
        // cf2pmi: res.data.main_data.cf2pmi,
      });
    });
  });
