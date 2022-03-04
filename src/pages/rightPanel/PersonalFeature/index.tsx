import React, { useCallback, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { IData } from '../../../database/db';
import { useAppSelector } from '../../../store/hooks';
import FeatureNode from '../../leftPanel/Overview/FeatureNode';
import useForceGraph from '../../leftPanel/Overview/useForceGraph';
import { fetchPersonalFeature } from './model';
import useTooltip from '../../../hooks/useTooltip';
import style from '../../leftPanel/Overview/index.module.scss';

interface IFeature {
  cf2cf_pmi: IData['cf2cf_pmi'];
  descriptions: IData['descriptions'];
}
const rScale = d3.scaleLinear<number, number>().domain([0, 1]).range([0, 8]);
const initOpacity = 1;
const afterOpacity = 0.4;
export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const chosenFigure = useAppSelector((state) => state.status.figureId);
  const [data, setData] = useState<IFeature | null>(null);
  const [hoveredDesId, setDesId] = useState<string | null>(null);
  const { element, setTipInfo } = useTooltip();

  useEffect(() => {
    if (chosenFigure !== '') {
      console.log(chosenFigure);
      setLoading(true);
      fetchPersonalFeature(chosenFigure).then((res) => {
        setData(res as IFeature);
        setLoading(false);
      });
    }
  }, [chosenFigure]);

  const { nodes, links, scale } = useForceGraph(data?.cf2cf_pmi || null);

  const handleMouseOver = useCallback(
    (id: string, e: any) => {
      setDesId(id);
      setTipInfo({
        content:
          data?.descriptions?.[id].features
            .map((d) => `${d.type}(${d.text})`)
            .join('\n') || '',
        left: e.nativeEvent.offsetX,
        top: e.nativeEvent.offsetY,
      });
    },
    [data?.descriptions, setTipInfo]
  );

  const handleMouseOut = useCallback(() => {
    setDesId(null);
    setTipInfo({ content: '' });
  }, [setTipInfo]);

  return (
    <div>
      {loading && <div className="loading-border" />}
      <svg viewBox="0 0 200 200">
        <g transform="translate(-50%, -50%)">
          {nodes.map(
            (node: any) =>
              data?.descriptions?.[node.id]?.features &&
              node.x &&
              node.y && (
                <FeatureNode
                  key={node.id}
                  id={node.id}
                  x={scale(node.x)}
                  y={scale(node.y)}
                  r={rScale(data.descriptions?.[node.id].proportion || 0)}
                  opacity={
                    hoveredDesId === null || hoveredDesId === node.id
                      ? initOpacity
                      : afterOpacity
                  }
                  data={data.descriptions?.[node.id].features || []}
                  handleMouseOut={handleMouseOut}
                  handleMouseOver={handleMouseOver}
                />
              )
          )}
        </g>
      </svg>
      <div className={[style.list, 'g-scroll'].join(' ')}>
        {Object.keys(data?.descriptions || {}).map((cfid) => {
          const value = data?.descriptions?.[cfid] || null;
          if (value) {
            const size = rScale(value.proportion) * value.features.length * 2;

            return (
              // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
              <div
                className={style.item}
                key={cfid}
                onMouseOver={() => setDesId(cfid)}
                onMouseOut={() => setDesId(null)}
              >
                <span>
                  <svg
                    width={size + 2}
                    height={rScale(value.proportion) * 2 + 2}
                    style={{
                      width: `${size + 2}px`,
                      height: `${rScale(value.proportion) * 2 + 2}px`,
                    }}
                  >
                    <FeatureNode
                      x={size / 2 + 1}
                      y={rScale(value.proportion) + 1}
                      r={rScale(value.proportion)}
                      opacity={initOpacity}
                      data={value.features}
                    />
                  </svg>
                </span>
                <p>
                  {value.features.map((d) => `${d.type}(${d.text})`).join('&')}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
      {element}
    </div>
  );
};
