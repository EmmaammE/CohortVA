import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { useAppDispatch } from '../../../../store/hooks';
import { setFigureIdArr } from '../../../../reducer/statusSlice';

const useBrush = (width: number, height: number, handle: any) => {
  const $brush = useRef<any>(null);

  const brush = useMemo(
    () =>
      d3
        .brushY()
        .extent([
          [2, 0],
          [width - 2, height],
        ])
        .on('end', handle),
    [handle, height, width]
  );

  useEffect(() => {
    d3.select($brush.current).call(brush);
  }, [brush]);

  return {
    $brush,
  };
};

export default useBrush;
