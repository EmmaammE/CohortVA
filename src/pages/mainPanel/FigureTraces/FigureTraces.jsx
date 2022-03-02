/* eslint-disable  */
import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import china from '../../../assets/geojson/full.json';
import './FigureTraces.scss';
import template from '../../../utils/tempelate';
import Tooltip from '../../../components/tooltip/Tip';
import { post } from '../../../api/tools';

const BOX_WIDTH = 260;
const BOX_HEIGHT = 208;
let maxVal = 0;
const path2 = d3
  .geoPath()
  .projection(
    d3.geoMercator().center([110, 11]).scale(250).translate([465, 365])
  );

const FigureTraces = ({ posToS }) => {
  const projection = d3
    .geoMercator()
    .center([110, 31])
    .scale(800)
    .translate([BOX_WIDTH, BOX_HEIGHT]);
  const path = d3.geoPath().projection(projection);
  const [state, setState] = useState({
    style: { opacity: 0 },
    data: [],
    title: '',
  });
  
  const $map = useRef(null)
  const $container = useRef(null)
  

  const drawCircle = useCallback(
    (data, addr_dict) => {
      const radiusScale = d3.scaleLinear().domain([0, maxVal]).range([0, 20]);
      d3.select($map.current)
        .selectAll('circle')
        .data(Object.keys(data))
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
          return 4;
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
              console.log(`sentence_category${sentence.category}`);
              const vKey = [];
              sentence.words.forEach((word, idx) => {
                vKey.push(word);
                vKey.push(sentence.edges[idx]);
              });
              const v = await template(sentence.category, vKey, 'name');
              // console.log(v)
              return v
            })).then(resultData => {
              const newState = {
                data: resultData,
                title: `count: ${targetData.length}`,
                style: { opacity: 1, left: e.clientX, top: e.clientY },
              };
              setState(newState);
            });
          }
        });
      console.log('draw traces finished');
  }, [$map, projection])


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
          for (const _data in res.data.Addr) {
            const curr = res.data.Addr[_data][0];
            if (curr && curr.x_coord !== null && curr.y_coord !== null) {
              addr[_data] = res.data.Addr[_data][0];
              addr[_data].count = posToS[_data];
              if (addr[_data].count.length > maxVal)
                maxVal = addr[_data].count.length;
            }
          }
          // console.log('addr', addr);
          drawCircle(posToS, addr);
        } else if (res.data.bug) {
            console.error(res.data.bug);
          }
      });
  }, [drawCircle, posToS])
 
  const handleTooltipClick = (e) => {
    const style = { ...state.style, opacity: 0 };
    setState({ ...state, style });
  };

  useEffect(() => {
    if (Object.keys(posToS).length > 0) getPositionToLat(posToS);
    else d3.select($map.current).selectAll('circle').remove();
  }, [$map, getPositionToLat, posToS]);

  const { style, data, title } = state;
  return (
    <>
      <div>
       
        <div className="mapContainer">
          <svg
            viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'relative' }}
            id="mapWithCircles"
          >
            <clipPath id="myClip">
              <rect
                x="450"
                y="300"
                width="70"
                height="110"
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
            </g>
            <rect
              x="450"
              y="300"
              width="70"
              height="110"
              stroke="black"
              fill="transparent"
            />
            <g clipPath="url(#myClip)">
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
    </>
  );
};

export default FigureTraces;
