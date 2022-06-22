import React from 'react';
import FeatureList from './PersonalFeature/FeatureList2';
import FigureInfo from './FigureTable';
import './index.scss';

const RightPanel = () => (
  <div id="right-panel">
    <h2 className="g-title">Figure Details</h2>
    <div className="person-view">
      <h3 className="g-title">Personal Info</h3>
      <FigureInfo />
    </div>
    <div className="view">
      <h3 className="g-title">Personal Features</h3>
      <FeatureList />
    </div>
  </div>
);

export default RightPanel;
