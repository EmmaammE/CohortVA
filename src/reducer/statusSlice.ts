import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IStatus {
  // selectedFigure
  figureId: string;
}

const initialState: IStatus = {
  figureId: '',
};

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setFigureId: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line no-param-reassign
      state.figureId = action.payload;
    },
  },
});

export const { setFigureId } = statusSlice.actions;
export default statusSlice.reducer;
