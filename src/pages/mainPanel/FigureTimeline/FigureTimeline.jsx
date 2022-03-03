/* eslint-disable react/prop-types */
import * as d3 from 'd3';
import './FigureTimeline.scss';
import React, { Component, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import template from '../../../utils/tempelate';
import Tooltip from '../../../components/tooltip/Tip';
import Axes from '../../../components/charts/Axes';
import Bars from '../../../components/charts/Bars';

const margin = { top: 5, bottom: 25, left: 40, right: 10 };
const height = 300;
const width = 280;

const FigureTimeline = ({ yearToS }) => {
  const [state, setState] = useState({
    style: { opacity: 0 },
    data: [],
    title: '',
  });

  const handleTooltipClick = (e) => {
    const style = { ...state.style, opacity: 0 };
    setState({ ...state, style });
  };

  const [xRange, setXRange] = useState([]);
  const [yMax, setYMax] = useState(0);

  useEffect(() => {
    const years = Object.keys(yearToS).map(d => +d).sort((a,b) => b-a)
    setXRange(years);
    setYMax(d3.max(years, (d) => yearToS[d].length));
  }, [yearToS])

  const xScale = useMemo(() => d3
    .scaleBand()
    .domain(xRange)
    .range([0, width - margin.right - margin.left])
    .padding(0.5), [xRange])

  const yScale = useMemo(() => d3
    .scaleLinear()
    .domain([0, yMax])
    .range([height - margin.top - margin.bottom, 0]),[yMax])

  const bars = useMemo(() => Object.keys(yearToS).map(year => ({
      x: xScale(year)+xScale.bandwidth()/2,
      y: yScale(yearToS[year].length),
      width: xScale.bandwidth()/2,
      height:yScale(0)- yScale(yearToS[year].length),
      year,
    })), [xScale, yScale, yearToS])

  const xFormat = useCallback((axis) => axis.tickValues(xScale.domain().filter((d,i)=> !(i%20))), [xScale]);

  const onMouseOnRect = (e,year) => {
    let targetData = yearToS[year]
    // tempDict的格式：{nodeOrEdgeId:nodeNameOrEdgeLabel}
    if (targetData.length > 50) {
      const count = targetData.length;
      targetData = targetData.slice(0, 20);
      targetData.count = count;
    }
    if (targetData.length > 0) {
      Promise.all(
        targetData.map(async (sentence) => {
          const vKey = [];
          sentence.words.forEach((word, idx) => {
            vKey.push(word);
            vKey.push(sentence.edges[idx]);
          });
          const v = await template(sentence.category, vKey, 'name');
          // console.log(v)
          return v;
        })
      ).then((resultData) => {
        const newState = {
          data: resultData,
          title: `count: ${
            targetData.count ? targetData.count : targetData.length
          }`,
          style: { opacity: 1, left: e.clientX, top: e.clientY },
        };
        setState(newState);
      });
    }
  }

  const onMouseOutRect = () => {
    setState({ ...state, style: { ...state.style, opacity: 0 } });
  }

  const { style, data, title } = state;
  return (
    <>
      <Tooltip
        style={style}
        data={data}
        title={title}
        handleClickX={handleTooltipClick}
      />
      <svg viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <Axes scale={xScale} scaleType="bottom" transform={`translate(0, ${height-margin.bottom-margin.top})`} format={xFormat}/>
          <Axes scale={yScale} scaleType="left"/>
          <Bars data={bars} 
            listeners={{onMouseOver: onMouseOnRect, onMouseOut: onMouseOutRect}}
          /> 
        </g>
      </svg>
    </>
  );
};

export default FigureTimeline;
