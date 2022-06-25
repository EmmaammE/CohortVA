/* eslint-disable  */
import React, { Component, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import china from '../../../assets/geojson/full.json';
import './FigureTraces.scss';
import template from '../../../utils/tempelate';
import Tooltip from '../../../components/tooltip/Tip';
import { post } from '../../../api/tools';
import { db } from '../../../database/db';
import eventMap from '../../../utils/eventMap';

import { Select } from 'antd';
const { Option } = Select;

const BOX_WIDTH = 220;
const BOX_HEIGHT = 120;
const path2 = d3
  .geoPath()
  .projection(
    d3.geoMercator().center([110, 11]).scale(300).translate([BOX_WIDTH*1.55, BOX_HEIGHT*2])
  );

const FigureTraces = ({ posToS }) => {
  const projection = d3
    .geoMercator()
    .center([105, 31])
    .scale(600)
    .translate([BOX_WIDTH, BOX_HEIGHT*1.28]);
  const path = d3.geoPath().projection(projection);
  const [state, setState] = useState({
    style: { opacity: 0, display: 'none' },
    data: [],
    title: '',
  });
  
  const $map = useRef(null)
  const $container = useRef(null)
  
  const [addr, setAddr] = useState(null);
  const [selectType, setSelectType] = useState('');
  const [maxVal, setMaxVal] = useState(0);

  const updateSelectType = useCallback((value) => {
    console.log(value)
    setSelectType(value);
    // drawCircle(posToS, addr)
  },[])

  const drawCircle = useCallback(
    (data, addr_dict) => {
      console.log('drawCircle')
      const radiusScale = d3.scaleLinear().domain([0, maxVal]).range([2, Math.log(maxVal)*4]);
      d3.select($map.current)
        .selectAll('circle')
        .data(Object.keys(data).slice(0,100))
        .enter()
        .append('circle')
        .attr('class', 'positionCircle')
        .attr('cx', (d) => {
          if (addr_dict[d])
            return projection([addr_dict[d].x_coord, addr_dict[d].y_coord])[0];
          return 0;
        })
        .attr('cy', (d) => {
          if (addr_dict[d])
            return projection([addr_dict[d].x_coord, addr_dict[d].y_coord])[1];
          return 0;
        })
        .attr('r', (d) => {
          if (addr_dict[d]) return radiusScale(data[d].length);
          return 2;
        })
        .on('mouseenter',(e) => {
          //
          if (!addr_dict[e.target.__data__])
            // siwei: 暂时加的有报错
            return;
          let targetData = addr_dict[e.target.__data__].count;
          if (targetData.length > 50) targetData = targetData.slice(0, 20);
          if (targetData.length > 0) {
  
            Promise.all(targetData.map(async (sentence) => {
              const sentenceData = await db.sentence.get(sentence.sentence);
              const vKey = [];
              sentenceData.words.forEach((word, idx) => {
                vKey.push(word);
                vKey.push(sentenceData.edges[idx]);
              });
              const v = await template(sentenceData.category, vKey, 'name');
              // console.log(v)
              return v
            })).then(resultData => {
              const newState = {
                data: resultData,
                title: `count: ${targetData.length}`,
                style: { opacity: 1, left: e.clientX+5, top: e.clientY-150 },
              };
              setState(newState);
            });
          }
        });
      // console.log('draw traces finished');
  }, [$map, projection, selectType])


  const getPositionToLat = useCallback(
    () => {
      const settings = {
        url: 'search_address_by_address_ids/',
        data: { 'address_ids[]': Object.keys(posToS) },
      };
      // console.log('settings', settings);
      post(settings).then((res) => {
        if (res.data.is_success) {
          const addr = {};
          let curMaxVal = maxVal;
          for (const _data in res.data.Addr) {
            const curr = res.data.Addr[_data][0];
            if (curr && curr.x_coord !== null && curr.y_coord !== null) {
              addr[_data] = res.data.Addr[_data][0];
              addr[_data].count = posToS[_data];
              if (addr[_data].count.length > maxVal)
                curMaxVal = addr[_data].count.length;
            }
          }
          // console.log('addr', addr);
          // drawCircle(posToS, addr);
          setMaxVal(curMaxVal);
          setAddr(addr);
        } else if (res.data.bug) {
            console.error(res.data.bug);
          }
      });
  }, [drawCircle, posToS])
 
  const handleTooltipClick = (e) => {
    const style = { ...state.style, opacity: 0,top:0,display:'none' };
    setState({ ...state, style });
  };

  useEffect(() => {
    if (Object.keys(posToS).length > 0) getPositionToLat(posToS);
    else d3.select($map.current).selectAll('circle').remove();

    setSelectType('')
  }, [$map, posToS]);

  const radiusScale = useMemo(() => {
    return d3.scaleLinear().domain([0, maxVal]).range([2, Math.min(Math.log(maxVal)*4,10)]);
  }, [maxVal])

  const handleHoverCircle = useCallback((targetData,e) => {
    if (targetData.length > 0) {
      targetData = targetData.filter(d => selectType === '' || d.type === selectType);
      Promise.all(targetData.slice(0,20).map(async (sentence) => {
        const sentenceData = await db.sentence.get(sentence.sentence);
        const vKey = [];
        sentenceData.words.forEach((word, idx) => {
          vKey.push(word);
          vKey.push(sentenceData.edges[idx]);
        });
        const v = await template(sentenceData.category, vKey, 'name');
        // console.log(v)
        return v
      })).then(resultData => {
        const newState = {
          data: resultData,
          title: `count: ${targetData.length}`,
          style: { opacity: 1, left: e.clientX+5, top: e.clientY-150 },
        };
        setState(newState);
      });
    }
  }, [selectType])
  const { style, data, title } = state;
  return (
    <div>
      
      <div className="event-map-select">
        <Select
          style={{ width: 120 }}
          placeholder="All"
          optionFilterProp="children"
          size="small"
          value={selectType}
          onChange={updateSelectType}
        >
          <Option value="">All</Option>

          {Object.keys(eventMap).map((key) => (
            <Option key={key} value={key}>
              {key?.[0].toUpperCase() + key.slice(1)}
            </Option>
          ))}
        </Select>
      </div>
      <div className="mapContainer">
        <svg
          width={2*BOX_WIDTH}
          height={2*BOX_HEIGHT}
          viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative' }}
          id="mapWithCircles"
        >
            
          <clipPath id="myClip">
            <rect
              x={BOX_WIDTH*1.7}
              y={BOX_HEIGHT*1.2}
              width="65"
              height="100"
              stroke="black"
              fill="transparent"
            />
          </clipPath>

        <g ref={$map}>
            <g>
              {china.features.map((d, i) => (
                <path
                  strokeWidth="1"
                  stroke="#999"
                  fill="#fff"
                  d={path(d)}
                  key={`fea-${i}`}
                />
              ))}
            </g>
            <g ref={$container} />
            <g>
              {
                Object.keys(eventMap).map(type => {
                  return <g>
                    {
                        addr &&  Object.keys(posToS).map(d => {
                          const size = posToS[d]?.filter(d => d.type === type).length||0;

                          return (
                            addr[d] && size && <circle 
                              className='positionCircle'
                              cx = {projection([addr[d].x_coord, addr[d].y_coord])[0]}
                              cy = {projection([addr[d].x_coord, addr[d].y_coord])[1]}
                              r ={radiusScale(size)}
                              fill={eventMap[type]?.color || '#373737'}
                              stroke={eventMap[type]?.color || '#373737'}
                              onMouseEnter={(e) =>handleHoverCircle(addr[d].count,e)}
                            /> 
                          )
                      })
                    }
                  </g>
                })
              }
              {/* {
                addr &&  Object.keys(posToS).map(d => {
                  const size = posToS[d].filter(d => selectType === '' || d.type === selectType).length

                  return (
                    <>
                      {
                        addr[d] && size && Object.keys(eventMap).map(type => {
                          const size = posToS[d].filter(d => d.type === type).length

                          return (
                            addr[d] && size && <circle 
                              className='positionCircle'
                              cx = {projection([addr[d].x_coord, addr[d].y_coord])[0]}
                              cy = {projection([addr[d].x_coord, addr[d].y_coord])[1]}
                              r ={radiusScale(size)}
                              fill={eventMap[type]?.color || '#373737'}
                              stroke={eventMap[type]?.color || '#373737'}
                              onMouseEnter={(e) =>handleHoverCircle(addr[d].count,e)}
                            /> 
                          )
                        })
                      }
                    </>
                  )
                  return (
                    addr[d] && size && <circle 
                      className='positionCircle'
                      cx = {projection([addr[d].x_coord, addr[d].y_coord])[0]}
                      cy = {projection([addr[d].x_coord, addr[d].y_coord])[1]}
                      r ={radiusScale(size)}
                      fill={eventMap[selectType]?.color || '#373737'}
                      stroke={eventMap[selectType]?.color || '#373737'}
                      onMouseEnter={(e) =>handleHoverCircle(addr[d].count,e)}
                    /> 
                  )
                })
              } */}
            </g> 
          </g> 
          
          {/* <g clipPath="url(#myClip)">
            {china.features.map((d, i) => (
              <path
                stroke="#999"
                fill="#fff"
                strokeWidth="1"
                d={path2(d)}
                key={`fea-${i}`}
              />
            ))}
          </g>
          <rect
            x={BOX_WIDTH*1.7}
            y={BOX_HEIGHT*1.2}
            width="65"
            height="100"
            stroke="black"
            fill="transparent"
          /> */}
        </svg>
      </div>

      <div className="mapView-label-container">
        <div className="tooltip-address">
          <Tooltip
            style={style}
            data={data}
            title={title}
            handleClickX={handleTooltipClick}
          />
        </div>
      </div>
    </div>
);
};

export default FigureTraces;
