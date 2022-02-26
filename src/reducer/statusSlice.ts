import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStatus {
  // selectedFigure
  figureId: string;
  // cf ids of selected classifier
  cfids: string[];
}

const initialState: IStatus = {
  figureId: '',
  cfids: [],
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setFigureId: (state, action: PayloadAction<string>) => {
      state.figureId = action.payload;
    },
    setCfids: (state, action: PayloadAction<string[]>) => {
      state.cfids = action.payload;
    },
  },
});

export const { setFigureId, setCfids } = statusSlice.actions;
export default statusSlice.reducer;
