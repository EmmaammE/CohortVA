import React from 'react';

const width = 3;
const height = 11;

const ProportionBar = ({ proportion }: { proportion: number }) => (
  <>
    <rect
      width={width}
      height={height}
      fill="#fff"
      stroke="#967558"
      strokeDasharray="1 1"
    />
    <rect
      x="0.5"
      y={height * (1 - proportion)}
      width={width - 1}
      height={height * proportion}
      fill="#967558"
    />
  </>
);

export default ProportionBar;
