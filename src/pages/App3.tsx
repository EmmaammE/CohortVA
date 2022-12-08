import React from 'react';
import './App3.scss';
import title from '../assets/icons/title.png';
import 'antd/dist/antd.css';
import LeftPanel from './beta3/leftPanel';
import MainPanel from './beta3/mainPanel';

const App = () => (
  <div className="App">
    <div className="header">
      <div className="title">
        <img src={title} alt="title" />
        <h1>Cohort VA</h1>
      </div>

      <h1>
        A Visual Analytic System for Iterative Exploration of Cohorts based on
        Historical Data
      </h1>
    </div>
    <div className="main">
      <LeftPanel />
      <MainPanel />
    </div>
  </div>
);
export default App;
