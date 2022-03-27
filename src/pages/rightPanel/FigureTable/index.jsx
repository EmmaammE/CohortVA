import React, { useCallback, useEffect, useState } from 'react';
import {Radio } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import FigureTable from './FigureTable';
import { updateFigureStatusById } from '../../../reducer/statusSlice';
import { getPersonId } from '../../../api';

const FigureInfo = () => {
  const figureName = useAppSelector((state) => state.status.figureName);
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const figureId = useAppSelector((state) => state.status.figureId);
  const dispatch = useAppDispatch();
  // 选中的人在cbdb中的id
  const [chosenFigure, setChoseFigure] = useState('')

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

  useEffect(() => {
    if(figureId !== '') {
     try {
      getPersonId(figureId).then(res => {
        setChoseFigure(res.data.people_info)
      })
     } catch(e) {
       console.log(e)
     }
    }
  },[figureId])

  return <div>
    {
      chosenFigure && (
        <div id="figureStatus" className='g-divider'>
          <span>{figureName}</span>
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
