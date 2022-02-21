/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Apis from '../api/apis';
import { post } from '../api/tools';
import type { RootState } from '../store';

type TPerson = {
  [pid: string]: {
    // eslint-disable-next-line camelcase
    en_name: string;
    id: string;
    label: string;
  };
};

type TGroup = {
  pids?: string[];
};

type Map = { [key: string]: any };

interface ICohorts {
  // 群体的id
  groups: string[][];
  pid2data: TPerson;
  id2group: TGroup & Map;
  // 当前探索的群体组序号
  groupIndex: number;
  // 当前组选择的分类器序号
  classifierIndex: number;
}

const initialState: ICohorts = {
  groups: [],
  pid2data: {},
  id2group: {},
  groupIndex: 0,
  classifierIndex: 0,
};

export const fetchCohortsAsync = createAsyncThunk(
  'cohorts/fetchCohorts',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_ranges,
      data: payload,
    });

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
        id2group,
        main_data: { groups, pid2data },
      } = payload;

      // console.log(payload);
      state.groups.push(groups);
      state.pid2data = pid2data;
      state.id2group = id2group;
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

export const { setGroupIndex } = cohortsSlice.actions;
export default cohortsSlice.reducer;
