import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStatus {
  // selectedFigure
  figureId: string;
  figureName: string;
  // cf ids of selected classifier
  cfids: string[];
  // 用于细节展示的人
  figureIdArr: string[];
  // 当前选中的群体的人的状态（包含/排除/推荐）
  figureStatus: {
    [key: string]: number;
  };
}

const initialState: IStatus = {
  figureId: '',
  figureName: '',
  cfids: [],
  figureIdArr: [],
  figureStatus: {},
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
    setFigureStatus: (
      state,
      action: PayloadAction<{ [key: string]: number }>
    ) => {
      state.figureStatus = action.payload;
    },
    updateFigureStatusById: (state, action) => {
      const { id, status } = action.payload;
      state.figureStatus[id] = status;
    },
  },
});

export const {
  setFigureId,
  setFigureName,
  setCfids,
  setFigureIdArr,
  setFigureStatus,
  updateFigureStatusById,
} = statusSlice.actions;
export default statusSlice.reducer;
