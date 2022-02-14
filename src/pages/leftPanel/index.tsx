import React from 'react';
import './index.scss';

const LeftPanel = () => (
  <div id="left-panel">
    <div className="figures-view g-divider panel">
      <h2 className="g-title">Specify Initial Figures</h2>
    </div>

    <div className="identification-view panel">
      <h2 className="g-title">Cohort Identification View</h2>
      <div className="iv--content">
        <div>
          <h3 className="g-title">Cohort Analysis Provenance</h3>
        </div>
        <div>
          <h3 className="g-title">Cohort Feature Overview</h3>
        </div>
      </div>
    </div>
  </div>
);

export default LeftPanel;
