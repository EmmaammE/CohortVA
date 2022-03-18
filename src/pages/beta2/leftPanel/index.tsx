import React, { useCallback, useEffect, useState } from 'react';
import AnalysisPanel from './AnalysisProvenance';
import CohortSearcherPanel from '../../leftPanel/CohortSearch';
import './index.scss';
import Overview from './Overview';
import { ReactComponent as ToggleICON } from '../../../assets/icons/toggle.svg';
import useTooltip from '../../../hooks/useTooltip';
import Button from '../../../components/button/Button';
import { useAppSelector } from '../../../store/hooks';

const expandStyle = {
  style: {
    height: 0,
    overflow: 'hidden',
  },
};

const LeftPanel = () => {
  // expand
  const [show, setShow] = useState(true);
  const toggleShow = useCallback(() => {
    setShow(!show);
  }, [show]);

  // hover info
  const { element, setTipInfo } = useTooltip();

  const tipInfo = useAppSelector((state) => state.feature.tipInfo);
  useEffect(() => {
    setTipInfo(
      tipInfo || {
        content: '',
      }
    );
  }, [setTipInfo, tipInfo]);

  return (
    <div id="left-panel">
      <div className="figures-view g-divider panel">
        <div className="figures-view--header">
          <h2 className="g-title">Specify Initial Figures</h2>
          <ToggleICON className="figures-view--icon" onClick={toggleShow} />
        </div>
        <div className="figures-view--content" {...(show ? {} : expandStyle)}>
          <CohortSearcherPanel />
        </div>
      </div>

      <div className="identification-view panel">
        <h2 className="g-title">Cohort Identification View</h2>
        <div className="iv--content">
          <div id="overview" className="g-divider">
            <h3 className="g-title">Cohort Feature Overview</h3>
            <Overview show={show} />
          </div>
          <div id="analysis">
            <h3 className="g-title">Cohort Analysis Provenance</h3>
            <AnalysisPanel />
            <Button text="Export" style={{ margin: '10px auto' }} />
          </div>
        </div>
      </div>

      {element}
    </div>
  );
};

export default LeftPanel;
