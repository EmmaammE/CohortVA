import React from 'react';
import FigureInfo from './FigureTable';
import './index.scss';

const RightPanel = () => (
  <div id="right-panel">
    <h2 className="g-title">Figure View</h2>
    <div className="person-view g-divider">
      <h3 className="g-title">Personal Info</h3>
      <FigureInfo />
    </div>
    <div className="view" />
  </div>
);

export default RightPanel;
