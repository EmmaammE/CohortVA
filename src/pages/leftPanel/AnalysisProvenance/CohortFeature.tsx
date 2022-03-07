import React, { useMemo } from 'react';
import { featureMap } from '../../../utils/atomTopic';

type Feature = {
  feature: string[]; // feature type
  cnt: number; // figure count
}[];

interface ICohortFeature {
  features?: Feature;
}

type TData = {
  info: {
    content: {
      x: number;
      fill: string;
    }[];
    ix: number;
    size: number;
  }[];
  maxV: number;
};

const tmp = [
  {
    feature: ['Group', 'Location'],
    cnt: 0.8,
  },
  {
    feature: ['Office'],
    cnt: 0.5,
  },
];

const WIDTH = 17;
const HEIGHT = 17;
const PADDING = 1;

const getPos = (features: Feature): TData => {
  const res = [];

  let prev = 0;
  for (let i = 0; i < features.length; i += 1) {
    prev += i * PADDING;
    const x1 = prev;
    const { feature, cnt } = features[i];

    // eslint-disable-next-line no-loop-func
    const content = feature.map((item, j) => ({
      x: prev + j * WIDTH,
      fill: featureMap[item],
    }));

    const x2 = x1 + WIDTH * feature.length;
    const size = cnt * HEIGHT * 0.7;
    const ix = (x2 - x1 - size) / 2 + x1;

    res.push({
      content,
      ix,
      size,
    });

    prev = x2;
  }

  return {
    info: res,
    maxV: prev,
  };
};

const CohortFeature = ({ features }: ICohortFeature) => {
  const { info, maxV } = useMemo(() => getPos(features || []), [features]);

  return (
    <svg height="17" width={maxV}>
      {info.map((feature) => {
        const { content, ix, size } = feature;
        return (
          <g key={feature.ix}>
            {content.map((item) => (
              <rect
                key={item.x}
                x={item.x}
                y={0}
                width={WIDTH}
                height={HEIGHT}
                fill={item.fill}
              />
            ))}
            <rect
              x={ix}
              y={(HEIGHT - size) / 2}
              width={size}
              height={size}
              fill="#fff"
            />
          </g>
        );
      })}
    </svg>
  );
};

CohortFeature.defaultProps = {
  features: tmp,
};

export default CohortFeature;
