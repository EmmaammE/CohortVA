import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IFeatureSlice {
  tipInfo: {
    left: number;
    top: number;
    content: string;
  } | null;
  featureId: string;
  links: string[];
}

const initialState: IFeatureSlice = {
  tipInfo: null,
  featureId: '',
  links: [],
};

export const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    setTipInfoAndFeatureId: (
      state,
      action: PayloadAction<{
        id: string;
        tipInfo: {
          left: number;
          top: number;
          content: string;
        } | null;
      }>
    ) => {
      const { id, tipInfo } = action.payload;
      state.tipInfo = tipInfo;
      state.featureId = id;
    },
    setLinks: (state, action: PayloadAction<string[]>) => {
      state.links = action.payload;
    },
  },
});

export const { setTipInfoAndFeatureId, setLinks } = featureSlice.actions;
export default featureSlice.reducer;
