import React from 'react';
import { IData } from '../../../database/db';
import { featureMap } from '../../../utils/atomTopic';

type DataItem = IData['descriptions'] extends { [k: string]: infer T }
  ? T
  : never;
type F = DataItem['features'];

interface INode {
  id?: string;
  x: number;
  y: number;
  r: number;
  opacity: number;
  stroke?: string;
  type?: number;
  data: F;
  handleMouseOut?: any;
  handleMouseOver?: any;
}

export const SIZE = 10;
const RATIO = 0.7;

const FeatureNode = ({
  id,
  x,
  y,
  r,
  opacity,
  stroke,
  data,
  type,
  handleMouseOut,
  handleMouseOver,
}: INode) => (
  <g
    transform={`translate(${-SIZE / 2},${-SIZE / 2})`}
    {...(handleMouseOver && handleMouseOut
      ? {
          onMouseOver: (e) => handleMouseOver(id, e),
          onMouseOut: handleMouseOut,
        }
      : {})}
  >
    <defs>
      <linearGradient key={id} id={`g${id}`} x1="0" x2="1" y1="0" y2="0">
        {data.map((f, i) => (
          <>
            {!!(i > 0) && (
              <stop
                offset={`${(i * 100) / data.length}%`}
                stopColor={featureMap[data[i - 1].type]}
              />
            )}
          </>
        ))}
        <stop
          offset="100%"
          stopColor={featureMap[data[data.length - 1].type]}
        />
      </linearGradient>
    </defs>

    {type === 1 && (
      <rect
        x={x - 3}
        y={y}
        width={3}
        height={SIZE}
        stroke="#979797"
        fill="none"
        opacity={opacity}
      />
    )}
    {type === 2 && (
      <rect
        x={x - 3}
        y={y - 3}
        width={SIZE}
        height={SIZE}
        stroke="#979797"
        fill="#fff"
        opacity={opacity}
      />
    )}
    <rect
      x={x}
      y={y}
      width={SIZE}
      height={SIZE}
      stroke={stroke !== '' ? stroke : `url(#g${id})`}
      fill={`url(#g${id})`}
      opacity={opacity}
      style={{
        transition: 'opacity 0.2s ease-in-out',
      }}
    />

    <rect
      x={x + ((1 - r * RATIO) * SIZE) / 2}
      y={y + ((1 - r * RATIO) * SIZE) / 2}
      width={r * RATIO * SIZE}
      height={r * RATIO * SIZE}
      fill="#fff"
    />
  </g>
);

FeatureNode.defaultProps = {
  id: '',
  stroke: '',
  type: 0,
  handleMouseOut: null,
  handleMouseOver: null,
};

export default FeatureNode;
