import React, { useCallback, useState } from 'react';
import AnalysisPanel from './AnalysisProvenance';
import CohortSearcherPanel from './CohortSearch';
import './index.scss';

const LeftPanel = () => {
  const [show, setShow] = useState(true);
  const [d, setPath] = useState<string | null>(null);

  const toggleShow = useCallback(() => {
    setShow(!show);
  }, [show]);

  return (
    <div id="left-panel">
      <div className="figures-view g-divider panel">
        <div className="figures-view--header">
          <h2 className="g-title">Specify Initial Figures</h2>
          <div className="figures-view--icon" onClick={toggleShow} />
        </div>
        {show && <CohortSearcherPanel />}
      </div>

      <div className="identification-view panel">
        <h2 className="g-title">Cohort Identification View</h2>
        <div className="iv--content">
          <div className="g-divider" style={{ flex: '0 0 50%' }}>
            <h3 className="g-title">Cohort Analysis Provenance</h3>
            <AnalysisPanel setPath={setPath} />
          </div>
          <div>
            <h3 className="g-title">Cohort Feature Overview</h3>
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
