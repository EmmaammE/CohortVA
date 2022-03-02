import React, { useCallback, useState } from 'react';
import { Select } from 'antd';
import Button from '../../components/button/Button';
import FeaturePanel from './FeaturePanel';
import FigureTimeline from './FigureTimeline';
import FigureTraces from './FigureTraces';
import './index.scss';
import InterpersonalEvent from './InterpersonalEvent';
import useTooltip from '../../hooks/useTooltip';

const buttons = ['Timeline', 'Map', 'Relationship', 'Update'];
const { Option } = Select;

const personList: { [k: string]: string } = {
  normalPeople: 'Included list',
  recommendPeople: 'Candidate list',
  refusedPeople: 'Excluded list',
};

const MainPanel = () => {
  const [selectedList, setSelectedList] = useState<string>('normalPeople');

  const onChangePersonList = useCallback((v) => {
    setSelectedList(v);
  }, []);
  const { element, setTipInfo } = useTooltip();

  return (
    <div id="main-panel">
      <h2 className="g-title">Cohort Explanation View </h2>

      <div className="op-container">
        {buttons.map((item) => (
          <Button text={item} key={item} />
        ))}
      </div>

      <div className="feature-view g-divider">
        <div className="feature-view--header">
          <div className="left-header">
            <h3 className="g-title">Cohort Feature View</h3>
          </div>
          <div className="right-header">
            <Select
              style={{ width: 150 }}
              placeholder="Include List"
              optionFilterProp="children"
              size="small"
              value={selectedList}
              onChange={onChangePersonList}
            >
              {Object.keys(personList).map((value) => (
                <Option key={value} value={value}>
                  {personList[value]}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        <FeaturePanel selectedList={selectedList} updateTip={setTipInfo} />
      </div>

      <div className="auxiliary">
        <div className="auxiliary-view">
          <h3 className="g-title">Cohort Map</h3>
          <FigureTraces />
        </div>
        <div className="auxiliary-view">
          <h3 className="g-title">Cohort Timeline</h3>
          <FigureTimeline />
        </div>
        <div className="auxiliary-view">
          <h3 className="g-title">Cohort Relationship</h3>
          <InterpersonalEvent />
        </div>
        <div className="auxiliary-view">
          <h3 className="g-title">Hierarchy Dictionary</h3>
        </div>
      </div>

      {element}
    </div>
  );
};

export default MainPanel;
