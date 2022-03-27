import React, { useEffect } from 'react';
import './App.scss';
import title from '../assets/icons/title.png';
import 'antd/dist/antd.css';
import topics from '../utils/atomTopic';
import LeftPanel from './beta2/leftPanel';
import MainPanel from './beta2/mainPanel';
import RightPanel from './rightPanel';
import { db } from '../database/db';

const App = () => (
  // useEffect(() => {
  //   // delete indexed db
  //   db.delete().then(() => db.open());
  // }, []);

  <div className="App">
    <div className="header">
      <div className="title">
        <img src={title} alt="title" />
        <h1>Cohort VA</h1>
      </div>

      <h1>
        A Visual Analytics System for Iterative Exploration of Historical
        Cohorts
      </h1>
    </div>

    <div className="main">
      <LeftPanel />
      <MainPanel />
      <RightPanel />
    </div>
  </div>
);
export default App;
