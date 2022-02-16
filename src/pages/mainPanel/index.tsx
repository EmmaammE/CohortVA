import React from 'react';
import Button from '../../components/button/Button';
import FigureTraces from './FigureTraces';
import './index.scss';

const buttons = ['Timeline', 'Map', 'Relationship', 'Update'];
const MainPanel = () => (
  <div id="main-panel">
    <h2 className="g-title">Cohort Explanation View </h2>

    <div className="op-container">
      {buttons.map((item) => (
        <Button text={item} key={item} />
      ))}
    </div>

    <div className="feature-view g-divider">
      <div className="feature-view--header">
        <h3 className="g-title">Cohort Feature View</h3>
      </div>
      <h3 className="g-title">Atomic Feature View</h3>
    </div>

    <div className="auxiliary">
      <div className="auxiliary-view">
        <h3 className="g-title">Cohort Map</h3>
        <FigureTraces />
      </div>
      <div className="auxiliary-view">
        <h3 className="g-title">Cohort Timeline</h3>
      </div>
      <div className="auxiliary-view">
        <h3 className="g-title">Cohort Relationship</h3>
      </div>
      <div className="auxiliary-view">
        <h3 className="g-title">Hierarchy Dictionary</h3>
      </div>
    </div>
  </div>
);

export default MainPanel;
