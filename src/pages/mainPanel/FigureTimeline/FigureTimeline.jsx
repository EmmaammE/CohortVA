/* eslint-disable */
import * as d3 from 'd3' 
import * as moment from 'moment' 
import './FigureTimeline.scss'
import React, { Component, useState, useEffect, useRef } from 'react'
import template from '../../../utils/tempelate'
import Tooltip from '../../../components/tooltip/Tip'

const FigureTimeline = ( {extract_feature, chosenDescriptorId}) => {
      const [state, setState] = useState({
            style: { opacity: 0 }, data: [], title: ''
      });
      const preprocessData = (data) => {
            const model_descriptor = data.id2model_descriptor[chosenDescriptorId.id];
            const {id2sentence} = data;
            const {id2node} = data;
            const {sentences} = model_descriptor;
            // yearToS的格式{<year_value>:sentence}
            const yearToS = {}
            sentences.forEach(s_id => {
                  // let isEvent = false;
                  const s = id2sentence[s_id];
                  for (let i = 0; i < s.words.length; i++) {
                        const w_id = s.words[i];
                        if (id2node[w_id].label === 'Year') {
                              // isEvent = true;
                              yearToS[id2node[w_id].en_name] ? yearToS[id2node[w_id].en_name].push(s) :
                                    yearToS[id2node[w_id].en_name] = [s];
                              break;
                        }
                  }
            })
            return yearToS;
      }
      const $containerRef = useRef()
      const handleTooltipClick=(e) =>{
            const style = { ...state.style,opacity:0};
            setState({...state,style})
          }
      useEffect(() => {
            if (chosenDescriptorId.id && extract_feature.id2node) {
                  const yearToEvents = preprocessData(extract_feature);
                  // console.log(yearToEvents)
                  const years = Object.keys(yearToEvents)
                  const largestY = years[0];
                  const smallestY = years[years.length];
                  const showBarNum = 10;
                  const margin = { top: 50, bottom: 20, left: 40, right: 0 };
                  const height = 375;
                  const width = 350;
                  const bandWidth = 20; const bandInner = 10;
                  let largestV = 0;
                  const yearToEventsSorted = [];
                  // years格式[2011,2012,...]
                  years.forEach(y => {
                        yearToEvents[y].year = y;
                        yearToEventsSorted.push(yearToEvents[y]);
                  })
                  //
                  // yearToEventsSorted格式[{...sentence1},{...sentence2}]
                  yearToEventsSorted.forEach((events, idx) => {
                        if (events.length > largestV)
                        largestV = events.length;
                  })
                  // console.log(largestV);
                  if(yearToEventsSorted.length===0){
                        alert('这个descriptor下没有时间属性')
                        return;
                  }
                  const yScale = d3.scaleLinear()
                  .domain([0, largestV])
                  .range([height - margin.top - margin.bottom-10, 0]);
                  const xScale = d3.scaleBand()
                  .domain(years)
                  .range([0, width - margin.right - margin.left-10]).padding(0.5);
                  d3.select($containerRef.current).selectAll('svg').remove();
                  const svg = d3.select($containerRef.current).selectAll('svg').data([1]).enter().append('svg')
                  .attr('class', 'barchart')
                  .attr('width', `${width  }px`);
                  const svgG = svg.append('g').attr('transform', `translate(${  margin.left  },${  20  })`);
                  svgG.selectAll('rect').data(yearToEventsSorted).enter()
                        .append('rect').attr('class', 'bar').style('width', xScale.bandwidth())
                        .attr('height', (d, i) => yScale(0) - yScale(d.length))
                        .attr('x', (d, i) => xScale(d.year))
                        .attr('y', (d, i) => yScale(d.length))
                        // .style('pointer-events','all')
                        .on('mouseenter', (e) => {
                              // 将选中的目标高亮
                              svgG.selectAll('rect').attr('fill-opacity', 0.1);
                              d3.select(e.target).attr('fill-opacity', 1);
                              // targetData格式: [{...sentence1},{...sentence2},{...sentence3}]
                              let targetData = e.target.__data__;
                              const {year} = targetData;
                              // tempDict的格式：{nodeOrEdgeId:nodeNameOrEdgeLabel}
                              if(targetData.length > 50){
                                    const count=targetData.length;
                                    targetData=targetData.slice(0,20)
                                    targetData.count=count;
                              } ;
                              if (targetData.length > 0) {
                                    const {id2node} = extract_feature;
                                    const {id2edge} = extract_feature;
                                    const {id2sentence} = extract_feature;
                                    // targetData格式: [{...sentence1},{...sentence2},{...sentence3}]
                                    const resultData = targetData.map(sentence => {
                                      const vKey = [];
                                      sentence.words.forEach((word,idx) => {
                                          vKey.push(word)
                                          vKey.push(sentence.edges[idx])
                                      })
                                      return template(sentence.category, vKey,
                                            'en_name',{ ...id2node, ...id2edge });
                                    })
                                    const newState = {
                                      ...state, data: resultData,
                                      title: `count: ${  targetData.count ? targetData.count : targetData.length}`,
                                      style: { opacity: 1, left: e.clientX, top: e.clientY }
                                    }
                                    setState({ ...newState } );
                              }
                              // console.log('e.targt.data:' + targetData);
                              // 只显示对应的ticks
                              xAxisGroup.selectAll('.tick').attr('opacity', 0).filter(
                                    d => d === year
                              ).attr('opacity', 1);
                              yAxisGroup.selectAll('.tick').attr('opacity', 0).filter(
                                    d => d === targetData.length
                              ).attr('opacity', 1);;
                              
                              
                        }).on('mouseleave', e => {
                              svgG.selectAll('rect').attr('fill-opacity', 1);
                              // setState({ ...state, style: { ...state.style, opacity: 0 } });
                              xAxisGroup.selectAll('.tick').attr('opacity', 1);
                              yAxisGroup.selectAll('.tick').attr('opacity', 1);
                        })
                  
                  const yAxis = d3.axisLeft(yScale).ticks(Math.min(largestV,10) );
                  const xAxis = d3.axisBottom(xScale).ticks(years.length);
                  let yAxisGroup = svgG.append("g")
                        .attr("class", "axis axis--y")
                        .call(yAxis);
                  let xAxisGroup = svgG
                        .append("g")
                        .attr("class", "xAxis axis")
                        .attr("transform", `translate(0,${  yScale(0)  } )`)
                        .call(xAxis);
                  const yTitle=svgG.append('text').attr('x',0).attr('y',-7).text('Event Number').attr('class','axis-title')
                  const xTitle=svgG.append('text').attr('x',289).attr('y',310).text('Years').attr('class','axis-title')
            }
            
      }, [chosenDescriptorId.id])
      const { style, data, title } = state;
      return (
            <>
                  <Tooltip style={style} data={data} title={title} handleClickX={handleTooltipClick}/>
                  <div ref={$containerRef} />
            </>
      );
}
export default FigureTimeline;  