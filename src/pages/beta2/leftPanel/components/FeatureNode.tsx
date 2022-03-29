import React, { useCallback } from 'react';
import * as d3 from 'd3';
import { useDispatch } from 'react-redux';
import { featureMap } from '../../../../utils/atomTopic';
import { setTipInfoAndFeatureId } from '../../../../reducer/featureSlice';
import { useAppSelector } from '../../../../store/hooks';

type TDescriptorsArr = {
  id?: string;
  text: string;
  type: string;
}[];

interface IFeatureNodeProps {
  id: string;
  data: TDescriptorsArr;
  // 是否展示tooltip
  showTip?: boolean;
  x?: number;
  y?: number;
  // 编码权重 -> 描边的粗细
  size?: number;
  // 额外的样式
  style?: Object;
  onClick?: any;
}

interface NodeProps {
  des: TDescriptorsArr;
  // eslint-disable-next-line
  style?: { [k: string]: any };
}

const SIZE = 6;

const arc = d3.arc();
const pieArc = Array(3)
  .fill(null)
  .map(
    (d, i) =>
      arc({
        innerRadius: 0,
        outerRadius: SIZE,
        startAngle: (i * 120 * Math.PI) / 180,
        endAngle: ((i + 1) * 120 * Math.PI) / 180,
      }) as string
  );
const Pie = ({ des, style = {} }: NodeProps) => (
  <g transform={`translate(${SIZE}, ${SIZE})`}>
    <circle
      r={SIZE}
      cx={0}
      cy={0}
      stroke="#232323"
      paintOrder="stroke"
      fill="transparent"
      {...style}
    />
    {des.map((d, i) => (
      <path
        key={d?.id ? d.id : i}
        d={pieArc[i]}
        fill={featureMap?.[d.type] || '#ccc'}
      />
    ))}
  </g>
);

const Rect = ({ des, style = {} }: NodeProps) => (
  <g transform={`translate(${SIZE}, ${SIZE})`}>
    <rect
      x={-SIZE}
      y={-SIZE}
      width={SIZE * 2}
      height={SIZE * 2}
      stroke="#232323"
      paintOrder="stroke"
      {...style}
    />
    {des.map((d, i) => (
      <rect
        key={d?.id ? d.id : i}
        x={-SIZE + i * SIZE}
        y={-SIZE}
        width={SIZE}
        height={SIZE * 2}
        fill={featureMap?.[d.type] || '#ccc'}
        stroke={featureMap?.[d.type] || '#ccc'}
      />
    ))}
  </g>
);

const Triangle = ({ des, style = {} }: NodeProps) => (
  <path
    transform={`translate(${SIZE}, ${SIZE})`}
    d={`M${0} ${-SIZE} 
      ${SIZE} ${(1.732 / 2) * SIZE} 
      ${-SIZE} ${(1.732 / 2) * SIZE}Z`}
    fill={featureMap?.[des[0].type] || '#ccc'}
    stroke="#232323"
    paintOrder="stroke"
    {...style}
  />
);

const initOpacity = 1;
const afterOpacity = 0.4;

const FeatureNode = ({
  data,
  id,
  showTip,
  x,
  y,
  size,
  style,
  onClick,
}: IFeatureNodeProps) => {
  const dispatch = useDispatch();
  const onMouseOver = useCallback(
    (e) => {
      dispatch(
        setTipInfoAndFeatureId({
          id,
          tipInfo: showTip
            ? {
                left: e.clientX + 5,
                top: e.clientY - 45,
                // content: data.map((d) => `${d.type}(${d.text})`).join('&'),
                content: `${data
                  .map((d) => `${d.type.slice(0, 1)}(${d.text})`)
                  .join('&')}`,
              }
            : null,
        })
      );
    },
    [data, dispatch, id, showTip]
  );
  const onMouseOut = useCallback(() => {
    dispatch(
      setTipInfoAndFeatureId({
        id: '',
        tipInfo: null,
      })
    );
  }, [dispatch]);

  const featureId = useAppSelector((state) => state.feature.featureId);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      opacity={
        featureId === '' || featureId === id ? initOpacity : afterOpacity
      }
      className="node"
      {...style}
      onClick={onClick || null}
    >
      {data.length === 1 && (
        <Triangle des={data} style={{ strokeWidth: size }} />
      )}
      {data.length === 2 && <Rect des={data} style={{ strokeWidth: size }} />}
      {data.length === 3 && <Pie des={data} style={{ strokeWidth: size }} />}
    </g>
  );
};

FeatureNode.defaultProps = {
  x: 0,
  y: 0,
  size: 0,
  showTip: false,
  style: {},
  onClick: null,
};
export default FeatureNode;
