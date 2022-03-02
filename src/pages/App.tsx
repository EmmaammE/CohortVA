import React from 'react';
import './App.scss';
import title from '../assets/icons/title.png';
import 'antd/dist/antd.css';
import topics from '../utils/atomTopic';
import LeftPanel from './leftPanel';
import MainPanel from './mainPanel';
import RightPanel from './rightPanel';

const App = () => (
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
