import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStatus {
  // selectedFigure
  figureId: string;
  figureName: string;
  // cf ids of selected classifier
  cfids: string[];
  // 用于细节展示的人
  figureIdArr: string[];
}

const initialState: IStatus = {
  figureId: '',
  figureName: '',
  cfids: [],
  figureIdArr: [],
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setFigureId: (state, action: PayloadAction<string>) => {
      state.figureId = action.payload;
    },
    setFigureName: (state, action: PayloadAction<string>) => {
      state.figureName = action.payload;
    },
    setCfids: (state, action: PayloadAction<string[]>) => {
      state.cfids = action.payload;
    },
    setFigureIdArr: (state, action: PayloadAction<string[]>) => {
      state.figureIdArr = action.payload;
    },
  },
});

export const {
  setFigureId,
  setFigureName,
  setCfids,
  setFigureIdArr,
} = statusSlice.actions;
export default statusSlice.reducer;
