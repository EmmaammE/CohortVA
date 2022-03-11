import React from 'react';
import { featureMap } from '../../../utils/atomTopic';

interface IGradients {
  features: {
    descriptorsArr: {
      id: string;
      text: string;
      type: string;
    }[];
    id: string;
  }[];
}

const Gradients = ({ features }: IGradients) => (
  <defs>
    {features.map(({ descriptorsArr: feature, id }, index) => (
      <linearGradient
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        id={`Gradient${id}`}
        x1="0"
        x2="1"
        y1="0"
        y2="0"
      >
        {/* <stop
              key={`${(i * 100) / feature.length}%-${i}`}
              offset={`${(i * 100) / feature.length}%`}
              stopColor={featureMap[f.type]}
            /> */}
        {feature.map((f, i) => (
          <>
            {!!(i > 0) && (
              <stop
                key={f.id}
                offset={`${(i * 100) / feature.length}%`}
                stopColor={featureMap[feature[i - 1].type]}
              />
            )}
            <stop
              // eslint-disable-next-line react/no-array-index-key
              key={`${(i * 100) / feature.length}%-${i}`}
              offset={`${(i * 100) / feature.length}%`}
              stopColor={featureMap[f.type]}
            />
          </>
        ))}
        <stop
          offset="100%"
          stopColor={featureMap[feature[feature.length - 1].type]}
        />
      </linearGradient>
    ))}
  </defs>
);

export default Gradients;
