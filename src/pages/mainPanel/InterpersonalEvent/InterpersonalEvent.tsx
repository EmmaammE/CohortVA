import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { Slider, Card } from 'antd';
import template from '../../../utils/tempelate';
import Tooltip from '../../../components/tooltip/Tip';
import style from './index.module.scss';
import { invert } from '../../../utils/scale';
import { db } from '../../../database/db';

type TSentence = any;

type TMap = { [k: string]: string };

interface IInterpersonalEvent {
  data: {
    [k: string]: TSentence[];
  };
  // colorScale: Function;
}

const WIDTH = 300;
const HEIGHT = 320;

const margin = {
  top: 40,
  left: 60,
  bottom: 0,
  right: 10,
};

const InterpersonalEvent = ({ data = {} }: IInterpersonalEvent) => {
  const [state, setState] = useState({
    style: { opacity: 0 },
    data: [],
    title: '',
  });
  const [nodesMap, setNodesMap] = useState<TMap>({});
  // 显示的名字坐标范围
  const [range, setRange] = useState<[number, number] | null>(null);

  // TODO? 这个顺序是否要调整
  const names = useMemo(
    () =>
      Object.keys(data).sort(
        (p1, p2) =>
          Object.values(data[p2]).reduce((acc, cur) => acc + cur.length, 0) -
          Object.values(data[p1]).reduce((acc, cur) => acc + cur.length, 0)
      ),
    [data]
  );

  const scale: any = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(names.slice(...(range || [0])))
        .range([0, WIDTH - margin.left - margin.right])
        .padding(0.1),
    [names, range]
  );

  const $brush = useRef<any>(null);

  const brush = useMemo(
    () =>
      d3
        .brush()
        .extent([
          [0, 0],
          [
            WIDTH - margin.left - margin.right,
            HEIGHT - margin.top - margin.bottom,
          ],
        ])
        .on('end', (e) => {
          if (e.selection) {
            const [xRange, yRange] = e.selection;
            const [x0, x1] = xRange;
            const [y0, y1] = yRange;
            const index = [Math.max(x0, y0), Math.min(x1, y1)]
              .map(invert(scale))
              .map((v: any) => Math.max(names.indexOf(v), 0))
              .sort((a, b) => a - b);

            setRange(index as any);

            d3.select($brush.current).call(brush.move, null);
          }
        }),
    [$brush, names, scale]
  );

  useEffect(() => {
    d3.select($brush.current).call(brush);
  }, [brush]);

  const [max, setMax] = useState<number>(names.length);

  useEffect(() => {
    setMax(names.length);
  }, [names.length]);

  useEffect(() => {
    // get string id to name
    db.node.bulkGet(names.map((d) => +d)).then((res) => {
      const map: TMap = {};
      res.forEach((node) => {
        if (node?.id && node?.en_name) {
          map[node.id] = node.en_name;
        }
      });

      setNodesMap(map);
    });
  }, [names]);

  const colorScale = useMemo(() => {
    let maxCnt = 0;
    Object.values(data).forEach((personToPerson) => {
      Object.values(personToPerson).forEach((events) => {
        maxCnt = Math.max(maxCnt, events.length);
      });
    });

    return d3
      .scaleLinear()
      .domain([0, maxCnt])
      .range(['#ddd', '#111'] as any);
  }, [data]);

  const handleSliderChangeEnd = (value: any) => {
    setRange(value);
  };
  const handleTooltipClick = () => {
    const s = { ...state.style, opacity: 0, left: 0 };
    setState({ ...state, style: s });
  };
  const handleMouseEnter = useCallback((e, value) => {
    Promise.all(
      value.slice(0, 20).map(async (sentence: any) => {
        const vKey: string[] = [];
        sentence.words.forEach((word: string, idx: number) => {
          vKey.push(word);
          vKey.push(sentence.edges[idx]);
        });
        const v = await template(sentence.category, vKey, 'name');
        return v;
      })
    ).then((resultData) => {
      const newState: any = {
        data: resultData,
        title: `count: ${value.length}`,
        style: { opacity: 1, left: e.clientX, top: e.clientY },
      };
      setState(newState);
    });

    // const resultData = value.map((sentence) => {
    // const sentence = id2sentence[relation["sentenceId"]];
    // console.log('sentence_category' + sentence['category']);
    // let vKey = [];
    // sentence.words.forEach((word, idx) => {
    //   vKey.push(word);
    //   vKey.push(sentence.edges[idx]);
    // });
    // return template(sentence['category'], vKey, 'name', {
    //   ...id2node,
    //   ...id2edge,
    // });
    // });
  }, []);

  const handleDoubleClick = () => {
    setRange(null);
  };

  return (
    <div className={style.container}>
      <div className={style.btns}>
        <div className={style.wrapper}>
          Events 0
          <span className={style.legend} />
          {colorScale.domain()[1]}
        </div>
        <div className={style.wrapper}>
          <span>Figure {Math.min(1, max)}</span>
          <Slider
            min={1}
            max={max}
            range
            value={range || [1, max]}
            step={1}
            onAfterChange={handleSliderChangeEnd}
          />
          <span>{max}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} onDoubleClick={handleDoubleClick}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g ref={$brush} />

          {names.slice(...(range || [0])).map((key: any) => (
            <g key={key}>
              {Object.keys(data[key]).map(
                (item: any) =>
                  !!scale(item) && (
                    <rect
                      key={item}
                      x={scale(key)}
                      y={scale(item)}
                      width={scale.bandwidth()}
                      height={scale.bandwidth()}
                      fill={
                        (colorScale(
                          data[key][item].length
                        ) as unknown) as string
                      }
                      onClick={(e) => handleMouseEnter(e, data[key][item])}
                    />
                  )
              )}
            </g>
          ))}

          <g>
            {range &&
              range[1] - range[0] < 35 &&
              names.slice(...(range || [0])).map(
                (key: any) =>
                  !!nodesMap[key] && (
                    <text
                      key={key}
                      transform={`translate(-10, ${
                        scale.bandwidth() / 2 + scale(key)
                      })`}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={10}
                    >
                      {nodesMap[key]}
                    </text>
                  )
              )}
          </g>
        </g>
      </svg>
      <Tooltip {...state} handleClickX={handleTooltipClick} />
    </div>
  );
};

export default InterpersonalEvent;
