import React, { useCallback, useEffect, useState } from 'react';
import AnalysisPanel from './AnalysisProvenance';
import CohortSearcherPanel from '../../leftPanel/CohortSearch';
import './index.scss';
import Overview from './Overview';
import { ReactComponent as ToggleICON } from '../../../assets/icons/toggle.svg';
import useTooltip from '../../../hooks/useTooltip';
import Button from '../../../components/button/Button';
import { useAppSelector } from '../../../store/hooks';
import { db } from '../../../database/db';
import legend1 from '../../../assets/legends/legend1.svg';
import legend2 from '../../../assets/legends/2.svg';

const expandStyle = {
  style: {
    height: 0,
    overflow: 'hidden',
  },
};

function downloadCSV(csv: any, filename: string) {
  const csvFile = new Blob([csv], { type: 'text/csv' });
  const downloadLink = document.createElement('a');

  // file name
  downloadLink.download = filename;

  // create link to file
  downloadLink.href = window.URL.createObjectURL(csvFile);

  // hide download link
  downloadLink.style.display = '';

  // add link to DOM
  document.body.appendChild(downloadLink);

  // click download link
  downloadLink.click();
}

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

  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const features = useAppSelector((state) => state.status.features);
  const exportData = useCallback(() => {
    const csv: string[] = [];
    csv.push(`features${features.join(',')}`);
    csv.push('');

    csv.push(['ch_name', 'name'].join(','));

    db.node
      .bulkGet(
        Object.keys(figureStatus)
          .filter((fid) => figureStatus[fid] === 0)
          .map((d) => +d)
      )
      .catch((e) => console.log(e))
      .then((res) => {
        res?.forEach((item) => {
          csv.push([item?.name, item?.en_name].join(','));
        });

        downloadCSV(csv.join('\r\n'), 'cohort.csv');
      });
  }, [features, figureStatus]);

  return (
    <div id="left-panel">
      <div className="figures-view g-divider panel">
        <div className="figures-view--header">
          <h2 className="g-title">Specify Initial Figures</h2>
          <ToggleICON
            className="figures-view--icon"
            onClick={toggleShow}
            style={show ? { transform: 'rotate(180deg)' } : {}}
          />
        </div>
        <div className="figures-view--content" {...(show ? {} : expandStyle)}>
          <CohortSearcherPanel />
        </div>
      </div>

      <div className="identification-view panel">
        <h2 className="g-title">Scope Specification View</h2>
        <div className="iv--content">
          <div id="overview" className="g-divider">
            <div>
              <img src={legend1} alt="legend" />
            </div>
            <h3 className="g-title">Cohort Feature Overview</h3>
            <Overview show={show} />
          </div>
          <div id="analysis">
            <h3 className="g-title">Cohort Analysis Provenance</h3>
            <div>
              <img src={legend2} alt="legend" />
            </div>
            <AnalysisPanel />
            <Button
              text="Export"
              style={{ margin: '10px auto' }}
              onClick={exportData}
            />
          </div>
        </div>
      </div>

      {element}
    </div>
  );
};

export default LeftPanel;
