/* eslint-disable no-console */
import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import Apis from '../api/apis';
import { post } from '../api/tools';
import { db, IData } from '../database/db';
import {
  descriptions,
  processData,
} from '../pages/mainPanel/FeaturePanel/features';
import type { RootState } from '../store';
import { getAtomFeature, preprocessData } from '../utils/feature';

type TPerson = {
  // eslint-disable-next-line camelcase
  en_name: string;
  id: string;
  label: string;
};

type TGroup = {
  [key: string]: {
    size: number;
    classifiers: {
      index: number;
      pids: string[];
    }[];
    atomFeature: unknown[];
  };
};

type Map = { [key: string]: any };

interface ICohorts {
  // 群体的id
  groups: string[];
  id2group: TGroup & Map;
  // 当前探索的群体组序号
  groupIndex: number;
  // 当前组选择的分类器序号
  classifierIndex: number;
}

const initialState: ICohorts = {
  groups: [],
  id2group: {},
  groupIndex: 0,
  classifierIndex: -1,
};

const handleResData = async (res: any) => {
  try {
    console.log(res.data);
    const {
      id2node,
      id2edge,
      id2sentence,
      id2composite_features,
      id2model_descriptor,
      main_data: { classifiers },
    } = res.data;

    await db.group
      .add({
        id: res.data.main_data.groups[0],
        cf2cf_pmi: res.data.main_data.cf2cf_pmi,
        descriptions: descriptions(res.data) as IData['descriptions'],
        // sentences: preprocessData(res.data),
      })
      .catch((e) => console.log(e));

    await db.node.bulkAdd(Object.values(id2node)).catch((e) => console.log(e));
    // await db.node
    //   .bulkAdd(
    //     Object.keys(id2edge).map((key) => ({
    //       id: +key,
    //       label: id2edge[key].label,
    //     }))
    //   )
    //   .catch((e) => console.log(e));
    await db.cohorts
      .bulkAdd(processData(res.data))
      .catch((e) => console.log(e));

    // await db.sentence
    //   .bulkAdd(
    //     Object.keys(id2sentence).map((key) => ({
    //       id: key,
    //       ...id2sentence[key],
    //     }))
    //   )
    //   .catch((e) => console.log(e));

    const cf2weight: { [key: string]: number } = {};
    classifiers.forEach((item: any) => {
      Object.keys(item.cf2weight).forEach((key) => {
        cf2weight[key] = item.cf2weight[key];
      });
    });

    await db.features
      .bulkAdd(
        Object.keys(id2composite_features).map((key) => {
          const feature = id2composite_features[key];
          feature.model_descriptors = feature.model_descriptors.map(
            (d: string) => ({
              type: id2model_descriptor[d].type,
              parms: id2model_descriptor[d].parms,
            })
          );
          return {
            id: key,
            weight: cf2weight[key] || 0,
            ...id2composite_features[key],
          };
        })
      )
      .catch((e) => console.log(e));
  } catch (e) {
    console.error((e as any).message);
  }
};

export const fetchCohortsAsync = createAsyncThunk(
  'cohorts/fetchCohorts',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_ranges,
      data: payload,
    });

    await handleResData(res);

    return res.data;
  }
);

export const fetchCohortByNameAsync = createAsyncThunk(
  'cohorts/fetchCohortByName',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_name,
      data: payload,
    });
    await handleResData(res);

    return res.data;
  }
);

export const fetchCohortByNamesAsync = createAsyncThunk(
  'cohorts/fetchCohortByNames',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_figure_names,
      data: payload,
    });
    await handleResData(res);

    return res.data;
  }
);

export const updateGroup = createAsyncThunk<
  any,
  {
    search_group: number[];
  }
>('cohorts/updateGroup', async (payload) => {
  const res = await post({
    url: Apis.extract_features,
    data: payload,
  });

  await handleResData(res);

  return res.data;
});

export const fetchCohortByRegexAsync = createAsyncThunk<
  any,
  {
    use_weight: boolean;
    features: any;
    search_group?: string[];
  }
>('cohorts/fetchCohortByRegex', async (payload) => {
  const res = await post({
    url: Apis.get_cohort_by_regex,
    data: payload,
  });
  await handleResData(res);

  return res.data;
});

const handleFetchCohortAction = (state: ICohorts, action: any) => {
  const { payload } = action;
  const {
    main_data: { size, groups, classifiers },
  } = payload;

  console.log(groups);
  state.groups.push(groups[0]);
};

export const cohortsSlice = createSlice({
  name: 'cohorts',
  initialState,
  reducers: {
    setGroupIndex: (state, action: PayloadAction<[number, number]>) => {
      const [x, y] = action.payload;
      state.groupIndex = x;
      state.classifierIndex = y;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCohortsAsync.fulfilled, handleFetchCohortAction)
      .addCase(fetchCohortByNameAsync.fulfilled, handleFetchCohortAction)
      .addCase(fetchCohortByNamesAsync.fulfilled, handleFetchCohortAction)
      .addCase(fetchCohortByRegexAsync.fulfilled, handleFetchCohortAction)
      .addCase(updateGroup.fulfilled, handleFetchCohortAction);
  },
});

// 返回当前选中的群体
export const getCohort = (state: RootState) => {
  const { groups, id2group, groupIndex, classifierIndex } = state.cohorts;
  if (groupIndex === null) {
    return {};
  }
  const groupId = groups[groupIndex][classifierIndex];
  return id2group[groupId];
};

// 返回所有的群体id
export const getGroups = (state: RootState) => state.cohorts.groups;

// 返回当前选择的群体id
export const getGroupId = (state: RootState) =>
  state.cohorts.groups[state.cohorts.groupIndex] || '';

export const { setGroupIndex } = cohortsSlice.actions;

export const setClientId = createAction<string>('setClientId');
export default cohortsSlice.reducer;
