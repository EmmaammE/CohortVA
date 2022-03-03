import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import tickStyle from './ticks.module.css';

type TScale = 'bottom' | 'left' | 'top' | 'right';

interface IAxes {
  scale: any;
  scaleType: TScale;
  transform: string;
  format: any;
}

const scaleHash = {
  bottom: 'axisBottom',
  left: 'axisLeft',
  top: 'axisTop',
  right: 'axisRight',
};

const Axes = ({ scale, scaleType, transform, format }: IAxes) => {
  const $g = useRef(null);

  useEffect(() => {
    const t = scaleHash[scaleType];

    let axis = (d3 as any)[t](scale);

    if (format) {
      axis = format(axis);
    }

    d3.select($g.current).transition().call(axis);
  }, [format, scale, scaleType]);

  return <g ref={$g} transform={transform} className={tickStyle['my-ticks']} />;
};

export default Axes;
