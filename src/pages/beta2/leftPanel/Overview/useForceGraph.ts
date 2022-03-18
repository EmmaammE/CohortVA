import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { IData } from '../../../../database/db';

type GraphData = IData['cf2cf_pmi'];

export const WIDTH = 250;
export const HEIGHT = 250;
const useForceGraph = (data: GraphData | null) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  const extent = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    if (!data) return;

    const curNodes: any = Object.keys(data).map((key) => ({ id: key }));

    const curLinks: any = [];

    let minV = 99999;
    let maxV = 0;
    Object.keys(data).forEach((node) => {
      const nodeData = data[node];
      Object.keys(nodeData).forEach((node2) => {
        curLinks.push({
          source: node,
          target: node2,
          value: nodeData[node2] <= 0 ? 0.000001 : 1 / nodeData[node2],
          // 1 / Math.exp(nodeData[node2]),
        });

        minV = Math.min(minV, 1 / Math.exp(nodeData[node2]));
        maxV = Math.max(maxV, 1 / Math.exp(nodeData[node2]));
      });
    });

    const scale = d3.scaleLinear().domain(extent.current).range([0, 1]);

    try {
      d3.forceSimulation(curNodes)
        .force(
          'link',
          d3
            .forceLink(curLinks)
            .id((d: any) => d.id)
            // .distance((d: any) => d.value * 10 + 1)
            // .strength((d: any) => scale(d.value) + 1)
            .distance((d: any) => d.value * 10)
            .strength((d: any) => scale(d.value))
        )
        .force('charge', d3.forceManyBody().strength(-0.1))
        .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
        // .force('collide', d3.forceCollide().radius(1))
        .force('collide', d3.forceCollide().radius(0.5))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .stop()
        .tick(10000);
    } catch (e) {
      console.log(e);
    }

    const [x1 = 0, x2 = 0] = d3.extent(curNodes, (d: any) => d.x);
    const [y1 = 0, y2 = 0] = d3.extent(curNodes, (d: any) => d.y);

    extent.current = [Math.min(+x1, +y1), Math.max(+x2, +y2)];

    setNodes(curNodes);
    setLinks(curLinks);
  }, [data]);

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
