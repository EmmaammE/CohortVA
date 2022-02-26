import React from 'react';
import { IData } from '../../../database/db';
import { featureMap } from '../../../utils/atomTopic';

type DataItem = IData['descriptions'] extends { [k: string]: infer T }
  ? T
  : never;
type F = DataItem['features'];

interface INode {
  x: number;
  y: number;
  r: number;
  opacity: number;
  data: F;
}

const FeatureNode = ({ x, y, r, opacity, data }: INode) => (
  <g transform={`translate(${(-(data.length - 1) * r) / 2},${0})`}>
    {data.map((d, i) => (
      <circle
        key={d.type}
        r={r}
        cx={x}
        cy={y}
        fill={featureMap[d.type]}
        transform={`translate(${r * i},0)`}
        fillOpacity={0.8}
        opacity={opacity}
        stroke={featureMap[d.type]}
        style={{
          transition: 'opacity 0.2s ease-in-out',
        }}
      />
    ))}
  </g>
);

export default FeatureNode;
