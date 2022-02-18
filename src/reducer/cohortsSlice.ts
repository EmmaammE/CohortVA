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
  // 当前选中的群体索引
  groupIndex: [number, number] | null;
}

const initialState: ICohorts = {
  groups: [],
  pid2data: {},
  id2group: {},
  groupIndex: [0, 0],
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
      state.groupIndex = action.payload;
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

      if (state.groupIndex === null) {
        state.groupIndex = [0, 0];
      }
      state.groups.push(groups);
      state.pid2data = pid2data;
      state.id2group = id2group;
    });
  },
});

// 返回当前选中的群体
export const getCohort = (state: RootState) => {
  const { groups, id2group, groupIndex } = state.cohorts;
  if (groupIndex === null) {
    return {};
  }
  const groupId = groups[groupIndex[0]][groupIndex[1]];
  return id2group[groupId];
};

// 返回所有的群体id
export const getGroups = (state: RootState) => state.cohorts.groups;

export default cohortsSlice.reducer;
