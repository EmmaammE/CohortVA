import React, { useCallback } from 'react';
import {Radio } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import FigureTable from './FigureTable';
import { updateFigureStatusById } from '../../../reducer/statusSlice';

const FigureInfo = () => {
  const chosenFigure = useAppSelector((state) => state.status.figureName);
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const figureId = useAppSelector((state) => state.status.figureId);
  const dispatch = useAppDispatch();

  const onChangeRadio = useCallback(
    ( e) => {
      if (e.target.value !== undefined) {
        dispatch(
          updateFigureStatusById({
            id: figureId,
            status: e.target.value,
          })
        );
      }
    },
    [dispatch, figureId]
  );

  return <div>
    {
      chosenFigure && (
        <div id="figureStatus">
          <span>{chosenFigure}</span>
          <Radio.Group
            value={figureStatus[figureId]}
            onChange={ onChangeRadio}
          >
            <Radio value={0} />
            <Radio value={1} />
            <Radio value={2} />
          </Radio.Group>
        </div>
      )
    }
    <FigureTable chosenFigure={chosenFigure} />
  </div>;
};

export default FigureInfo;
