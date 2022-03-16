import React from 'react';
import FeatureList from './PersonalFeature/FeatureList';
import FigureInfo from './FigureTable';
import './index.scss';

const RightPanel = () => (
  <div id="right-panel">
    <h2 className="g-title">Figure View</h2>
    <div className="person-view g-divider">
      <h3 className="g-title">Personal Info</h3>
      <FigureInfo />
    </div>
    <div className="view">
      <h3 className="g-title">Feature List</h3>
      <FeatureList />
    </div>
  </div>
);

export default RightPanel;
