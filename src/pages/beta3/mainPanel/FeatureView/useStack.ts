import { useMemo } from 'react';
import * as d3 from 'd3';
import { padding } from '../utils';

const stackWithPadding = (stack: any, config: number) => {
  const columnSize = stack?.[0]?.length || 0;
  const rowSize = stack?.length || 0;

  for (let i = 0; i < columnSize; i += 1) {
    for (let j = 0; j < rowSize; j += 1) {
      const d = stack[j][i];

      const next = stack[j][i + 1];

      if (d[1] !== d[0]) {
        d[0] += config;
      }
    }
  }

  // console.log(stack);

  return stack;
};

const useStack = (data: any, groups: string[], keys: string[] | number[]) => {
  const stack = useMemo(
    () =>
      d3
        .stack()
        .keys(groups)
        .value((d, key) => data?.[d as any]?.[key] || 0)(keys as any),
    [data, groups, keys]
  );

  return stack;
};

export default useStack;
