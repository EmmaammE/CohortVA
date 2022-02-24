import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import FigureTable from './FigureTable';

const FigureInfo = () => {
  const chosenFigure = useAppSelector((state) => state.status.figureId);

  return <FigureTable chosenFigure={chosenFigure} />;
};

export default FigureInfo;
