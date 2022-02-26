import React, { useCallback, useEffect, useRef, useState } from 'react';
import AnalysisPanel from './AnalysisProvenance';
import CohortSearcherPanel from './CohortSearch';
import './index.scss';
import Overview from './Overview';

type TPos = [number, number];

const x2 = 331;
const y2 = 334;

const lineFunction = (points: [number[], number[]]): string => {
  const start = points[0];
  const end = points[1];

  const control1 = [start[0] + (end[0] - start[0]) / 3, start[1]];
  const control2 = [end[0] - (end[0] - start[0]) / 3, end[1]];

  const dStr = `M${start[0]} ${start[1]}C${control1[0]} ${control1[1]},${control2[0]} ${control2[1]},${end[0]} ${end[1]}`;

  return dStr;
};

const drawCurve = ([x, y]: TPos) =>
  lineFunction([
    [x, y],
    [x2, y2],
  ]);

const getPos = (e: any) => {
  const bound = e.getBoundingClientRect();
  const y = bound.top - 40;
  const x = bound.left + bound.width;
  return [x, y];
};
const LeftPanel = () => {
  const [show, setShow] = useState(true);
  const [d, setPath] = useState<string | null>(null);
  const [$clicked, setClickedElement] = useState<any>(null);

  const prevPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (prevPos.current) {
      const [x, y] = prevPos.current;
      if (show) {
        setPath(drawCurve([x, y + 460]) as string);
      } else {
        setPath(drawCurve([x, y - 460]) as string);
      }
    }
  }, [show]);

  useEffect(() => {
    if ($clicked) {
      const [x, y] = getPos($clicked);
      setPath(drawCurve([x, y]) as string);
      prevPos.current = [x, y];
    }
  }, [$clicked]);

  const toggleShow = useCallback(() => {
    setShow(!show);
    setPath(null);
  }, [show]);

  return (
    <div id="left-panel">
      <div className="figures-view g-divider panel">
        <div className="figures-view--header">
          <h2 className="g-title">Specify Initial Figures</h2>
          <div className="figures-view--icon" onClick={toggleShow} />
        </div>
        <div
          className="figures-view--content"
          style={
            !show
              ? {
                  height: 0,
                  overflow: 'hidden',
                }
              : {}
          }
        >
          <CohortSearcherPanel />
        </div>
      </div>

      <div className="identification-view panel">
        <h2 className="g-title">Cohort Identification View</h2>
        <div className="iv--content">
          <div className="g-divider" style={{ flex: '0 0 44%' }}>
            <h3 className="g-title">Cohort Analysis Provenance</h3>
            <AnalysisPanel setPath={setClickedElement} />
          </div>
          <div id="overview">
            <h3 className="g-title">Cohort Feature Overview</h3>
            <Overview />
          </div>
        </div>
      </div>

      <div id="link-view">
        <svg>{d && <path d={d} />}</svg>
      </div>
    </div>
  );
};

export default LeftPanel;
