import * as d3 from 'd3';
// eslint-disable-next-line import/prefer-default-export
export const invert = (xScale: any) => {
  const domain = xScale.domain();
  const range = xScale.range();
  const scale = d3.scaleQuantize().domain(range).range(domain);

  return (x: any) => scale(x);
};
