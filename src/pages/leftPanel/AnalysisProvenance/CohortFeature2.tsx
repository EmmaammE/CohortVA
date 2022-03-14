import React from 'react';
import { featureMap } from '../../../utils/atomTopic';
import { IAtomFeature } from '../../mainPanel/types';

interface ICFeature {
  id: string;
  proportion: number;
  descriptorsArr: IAtomFeature[];
}

interface Features extends ICFeature {
  redundancyFeatures: ICFeature[];
  subFeatures: ICFeature[];
}

interface ICohortFeature {
  features: Features[];
  expand: boolean;
  handleMouseOver: Function;
  handleMouseOut: Function;
}

const WIDTH = 18;
const HEIGHT = 18;
const PADDING = 12;
const RATIO = 0.7;

interface IGradient {
  features: { id: string; descriptorsArr: IAtomFeature[] }[];
}
const getUniqueFeatures = (features: Features[]) => {
  const res: IGradient['features'] = [];
  const ids = new Set();

  features.forEach((f) => {
    ids.add(f.id);

    f.redundancyFeatures.forEach((rf) => {
      if (!ids.has(rf.id)) {
        res.push({
          id: rf.id,
          descriptorsArr: rf.descriptorsArr,
        });
        ids.add(rf.id);
      }
    });

    f.subFeatures.forEach((rf, i) => {
      res.push({
        id: `${f.id}-${i}`,
        descriptorsArr: rf.descriptorsArr,
      });
      ids.add(rf.id);
    });
  });

  return res;
};

const CohortFeature = ({
  features,
  expand,
  handleMouseOut,
  handleMouseOver,
}: ICohortFeature) => (
  <svg
    height={expand ? HEIGHT * 5 + PADDING * 4 : HEIGHT}
    width={WIDTH * 5 + PADDING * 4}
  >
    <defs>
      <FeatureGradient features={features} />
      {expand && <FeatureGradient features={getUniqueFeatures(features)} />}
    </defs>

    {features?.map((feature, i: number) => {
      const { proportion: cnt, id, redundancyFeatures, subFeatures } = feature;
      return (
        <g key={id}>
          <FeatureBox
            cnt={cnt}
            id={id}
            x={i * (WIDTH + PADDING)}
            y={0}
            content={feature.descriptorsArr
              .map((d) => `${d.type}${d.text}`)
              .join('\n')}
            handleMouseOut={handleMouseOut}
            handleMouseOver={handleMouseOver}
          />

          {expand &&
            redundancyFeatures?.map((rf, j) => (
              <FeatureBox
                key={rf.id}
                cnt={rf.proportion}
                id={rf.id}
                x={i * (WIDTH + PADDING)}
                y={(1 + j) * (HEIGHT + PADDING)}
                content={rf.descriptorsArr
                  .map((d) => `${d.type}${d.text}`)
                  .join('\n')}
                handleMouseOut={handleMouseOut}
                handleMouseOver={handleMouseOver}
              />
            ))}

          {expand &&
            subFeatures?.map((sf, j) => (
              <FeatureBox
                // eslint-disable-next-line react/no-array-index-key
                key={`${id}-${j}`}
                cnt={sf.proportion}
                id={`${id}-${j}`}
                x={i * (WIDTH + PADDING)}
                y={(3 + j) * (HEIGHT + PADDING)}
                content={sf.descriptorsArr
                  .map((d) => `${d.type}${d.text}`)
                  .join('\n')}
                handleMouseOut={handleMouseOut}
                handleMouseOver={handleMouseOver}
              />
            ))}

          {!!i && expand && (
            <line
              x1={i * (WIDTH + PADDING) - (1 / 2) * PADDING}
              y1="20%"
              x2={i * (WIDTH + PADDING) - (1 / 2) * PADDING}
              y2="100%"
              strokeDasharray="4 4"
              stroke="#ccc"
            />
          )}
        </g>
      );
    })}
  </svg>
);

export default CohortFeature;

const FeatureBox = ({
  cnt,
  id,
  x,
  y,
  content,
  handleMouseOut,
  handleMouseOver,
}: {
  cnt: number;
  id: string | number;
  x: number;
  y: number;
  content: string;
  handleMouseOut: any;
  handleMouseOver: any;
}) => (
  <g
    transform={`translate(${x}, ${y})`}
    onMouseOver={(e) => handleMouseOver(content, e)}
    onMouseOut={handleMouseOut}
  >
    <rect
      x={0}
      y={0}
      width={WIDTH}
      height={HEIGHT}
      stroke={`url(#g${id})`}
      fill={`url(#g${id})`}
      fillOpacity={0.8}
    />
    <rect
      x={((1 - cnt * RATIO) * WIDTH) / 2}
      y={((1 - cnt * RATIO) * HEIGHT) / 2}
      width={cnt * RATIO * WIDTH}
      height={cnt * RATIO * WIDTH}
      fill="#fff"
    />
  </g>
);

const FeatureGradient = ({ features }: { features: IGradient['features'] }) => (
  <>
    {features.map(({ id, descriptorsArr }) => (
      <linearGradient key={id} id={`g${id}`} x1="0" x2="1" y1="0" y2="0">
        {descriptorsArr.map(
          (f, i) =>
            !!(i > 0) && (
              <stop
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                offset={`${(i * 100) / descriptorsArr.length}%`}
                stopColor={featureMap[descriptorsArr[i - 1].type]}
              />
            )
        )}
        <stop
          offset="100%"
          stopColor={featureMap[descriptorsArr[descriptorsArr.length - 1].type]}
        />
      </linearGradient>
    ))}
  </>
);
