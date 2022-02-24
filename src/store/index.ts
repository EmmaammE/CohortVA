import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import cohortsReducer from '../reducer/cohortsSlice';
import statusReducer from '../reducer/statusSlice';

export const store = configureStore({
  reducer: {
    cohorts: cohortsReducer,
    status: statusReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
