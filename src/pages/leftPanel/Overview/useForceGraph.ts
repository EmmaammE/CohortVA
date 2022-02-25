import { useMemo } from 'react';
import * as d3 from 'd3';
import { IData } from '../../../database/db';

type GraphData = IData['cf2cf_pmi'];

const WIDTH = 200;
const HEIGHT = 200;
const useForceGraph = (data: GraphData | null) => {
  const nodes: any = useMemo(() => {
    if (!data) return [];

    return Object.keys(data).map((key) => ({ id: key }));
  }, [data]);

  let minV = 0;
  let maxV = 9999;

  const links: any = useMemo(() => {
    if (!data) return [];

    return Object.keys(data).map((node) => {
      const nodeData = data[node];
      return Object.keys(nodeData).map((node2) => {
        minV = Math.min(minV, nodeData[node2]);
        maxV = Math.max(maxV, nodeData[node2]);
        return {
          source: node,
          target: node2,
          value: nodeData[node2] < 0 ? 0.00001 : nodeData[node2],
        };
      });
    });
  }, [data]);

  const valueScale = d3.scaleLinear().domain([minV, maxV]).range([0, 1]);

  try {
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => valueScale(d.value))
          .strength((d) => 0.1)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop()
      .tick(10000);
  } catch (e) {
    console.log(e);
  }

  console.log(nodes);
  console.log(links);

  return {
    nodes,
    links,
  };
};

export default useForceGraph;
