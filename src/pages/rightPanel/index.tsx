import React from 'react';
import FigureInfo from './FigureTable';
import './index.scss';
import PersonalFeature from './PersonalFeature';

const RightPanel = () => (
  <div id="right-panel">
    <h2 className="g-title">Figure View</h2>
    <div className="person-view g-divider">
      <h3 className="g-title">Personal Info</h3>
      <FigureInfo />
    </div>
    <div className="view">
      <h3 className="g-title">Feature Distribution</h3>
      <PersonalFeature />
    </div>
  </div>
);

export default RightPanel;
