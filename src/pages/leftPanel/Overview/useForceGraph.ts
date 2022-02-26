import { useEffect, useMemo, useRef } from 'react';
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

  const links: any = useMemo(() => {
    if (!data) return [];
    const curLinks: unknown[] = [];

    Object.keys(data).forEach((node) => {
      const nodeData = data[node];
      Object.keys(nodeData).forEach((node2) => {
        curLinks.push({
          source: node,
          target: node2,
          value: nodeData[node2] < 0 ? 0.00001 : nodeData[node2],
        });
      });
    });

    return curLinks;
  }, [data]);

  const extent = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    try {
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance((d: any) => d.value)
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

    const [x1 = 0, x2 = 0] = d3.extent(nodes, (d: any) => d.x);
    const [y1 = 0, y2 = 0] = d3.extent(nodes, (d: any) => d.y);

    extent.current = [Math.min(+x1, +y1), Math.max(+x2, +y2)];
  }, [links, nodes]);

  return {
    nodes,
    links,
    scale: d3
      .scaleLinear()
      .domain(extent.current)
      .range([25, WIDTH - 25]),
  };
};

export default useForceGraph;
