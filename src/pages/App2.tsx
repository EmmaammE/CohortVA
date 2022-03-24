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
        <h1>Cohort Visual Analysis in Historical Figures</h1>
      </div>

      <div className="symbols">
        {topics.map((topic) => (
          <div key={topic.text} className="symbol">
            <span
              style={{
                background: topic.color,
              }}
            />
            <p>{topic.text}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="main">
      <LeftPanel />
      <MainPanel />
      <RightPanel />
    </div>
  </div>
);
export default App;
