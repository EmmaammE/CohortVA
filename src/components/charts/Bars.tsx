/* eslint-disable import/no-extraneous-dependencies */
import { config, useTransition } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React from 'react';

const barStyle = {
  fill: '#ddd',
  stroke: '#cdcdcd',
};

interface IBars {
  data: Array<{
    width: number;
    height: number;
    x: number;
    y: number;
    [k: string]: any;
  }>;
  listeners: any;
}

const Bars = ({ data, listeners }: IBars) => {
  const transition = useTransition(data, {
    trail: 800 / data.length,
    from: { opacity: 0, height: 0, y: 0 },
    enter: ({ y }) => ({ opacity: 1, y }),
    leave: { opacity: 0, height: 0, y: 0 },
    config: config.molasses,
  });

  return (
    <g>
      {transition(({ opacity }, { width, height, x, y, ...rest }) => (
        <animated.rect
          width={width}
          height={height}
          x={x}
          y={y}
          {...barStyle}
          {...rest}
          opacity={opacity}
          onMouseOut={listeners.onMouseOut}
          onMouseOver={(e) => listeners.onMouseOver(e, rest.year)}
        />
      ))}
    </g>
  );
};

export default Bars;
