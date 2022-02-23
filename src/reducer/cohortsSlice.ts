/* eslint-disable no-param-reassign */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Dexie from 'dexie';
import Apis from '../api/apis';
import { post } from '../api/tools';
import { db } from '../database/db';
import type { RootState } from '../store';
import { getAtomFeature } from '../utils/feature';

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
  classifierIndex: 0,
};

export const fetchCohortsAsync = createAsyncThunk(
  'cohorts/fetchCohorts',
  async (payload) => {
    const res = await post({
      url: Apis.get_cohort_by_ranges,
      data: payload,
    });

    console.log(res.data);

    // eslint-disable-next-line camelcase
    const { id2node, main_data } = res.data;

    await db.node
      .bulkAdd(Object.values(id2node))
      .then((lastKey) => {
        console.log(`Last raindrop's id was: ${lastKey}`);
      })
      .catch(Dexie.BulkError, (e) => {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.log(e.message);
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
        main_data: { size, groups, classifiers },
      } = payload;

      const atomFeature = getAtomFeature(payload);

      console.log(atomFeature);

      state.groups.push(groups[0]);
      // state.pid2data = pid2data;
      state.id2group[groups[0]] = {
        size,
        classifiers,
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

export const { setGroupIndex } = cohortsSlice.actions;
export default cohortsSlice.reducer;
