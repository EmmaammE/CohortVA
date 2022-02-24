/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Apis from '../api/apis';
import { post } from '../api/tools';
import { db } from '../database/db';
import { processData } from '../pages/mainPanel/FeaturePanel/features';
import type { RootState } from '../store';
import { getAtomFeature } from '../utils/feature';

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

export const fetchCohortsAsync = createAsyncThunk(
  'cohorts/fetchCohorts',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_ranges,
      data: payload,
    });

    try {
      const { id2node } = res.data;

      await db.node.bulkAdd(Object.values(id2node));

      await db.cohorts.bulkAdd(processData(res.data));
    } catch (e) {
      console.log((e as any).message);
    }

    return res.data;
  }
);

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
    builder.addCase(fetchCohortsAsync.fulfilled, (state, action) => {
      const { payload } = action;
      const {
        main_data: { size, groups, classifiers },
      } = payload;

      const atomFeature = getAtomFeature(payload);

      console.log(atomFeature);

      state.groups.push(groups[0]);
      state.id2group[groups[0]] = {
        size,
        classifiers: classifiers.map((c: any, index: number) => ({
          index,
          pids: c.normal_pids.map((p: TPerson) => p.id),
        })),
        atomFeature,
      };
    });
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
export default cohortsSlice.reducer;
