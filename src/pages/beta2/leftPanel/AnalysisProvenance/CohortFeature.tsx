import React, { useCallback, useMemo, useState } from 'react';
import Button from '../../../../components/button/Button';
import TagSlider, { ITagSlider } from '../../../../components/slider';
import { db } from '../../../../database/db';
import {
  fetchCohortByRegexAsync,
  updateCohortByRegexAsync,
} from '../../../../reducer/cohortsSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import FeatureNode from '../components/FeatureNode';
import ProportionBar from '../components/ProportionBar';

interface ICFeature {
  id: string;
  proportion: number;
  weight?: number;
  descriptorsArr: {
    id?: string;
    text: string;
    type: string;
  }[];
}

interface FeatureData extends ICFeature {
  redundancyFeatures: ICFeature[];
  subFeatures: ICFeature[];
}

interface ICohortFeature {
  j: number; // 第一个分类器
  features: FeatureData[];
  size: number;
}

const btnStyle = {
  height: '20px',
  lineHeight: '20px',
  margin: '10px auto 15px',
  width: '100px',
};
const CohortFeature = ({ j, features, size }: ICohortFeature) => {
  const dispatch = useAppDispatch();
  const figureStatus = useAppSelector((state) => state.status.figureStatus);
  const weightData = useMemo(() => {
    const data: ITagSlider['data'] = [];
    let sum = 0;

    features.forEach((feature, i: number) => {
      sum += feature?.weight || 0;
      data.push({
        id: feature.id,
        weight: feature?.weight || 0,
        name: String.fromCharCode(97 + i),
      });
    });

    return {
      sum,
      data,
    };
  }, [features]);

  const [widths, setWidths] = useState<number[]>(
    weightData.data.map((d) => (d.weight / weightData.sum) * 100)
  );

  const update = useCallback(() => {
    db.features
      .bulkGet(features.map((f) => f.id))
      .then((featuresParam) => {
        const newFeatures = featuresParam.map((f, i) => ({
          ...f,
          weight: (widths[i] / 100) * weightData.sum,
        }));

        const param = {
          use_weight: true,
          features: newFeatures.reduce(
            (acc, cur, i) => ({
              ...acc,
              [cur?.id || '']: cur,
            }),
            {}
          ),
          search_group: Object.keys(figureStatus).filter(
            (d) => figureStatus[d] !== 2
          ),
        };

        db.features.bulkPut(newFeatures as any);
        dispatch(updateCohortByRegexAsync(param));
      })
      .catch((e) => console.log(e));
  }, [dispatch, features, figureStatus, weightData.sum, widths]);

  return (
    <div className="cohort-item-row active">
      <div className="active-item">
        <span className="menu">{j + 1}</span>
        <TagSlider
          data={weightData.data}
          sum={weightData.sum}
          widths={widths}
          setWidths={setWidths}
        />
        <span className="right-menu" />
        <span className="info-size">{size}</span>
      </div>
      {features.map((f, i) => (
        <div key={f.id} className="active-item info-item">
          <div className="info">
            <span>{String.fromCharCode(i + 97)}</span>
            <svg width="15px" height="15px" viewBox="0 0 12 12">
              <FeatureNode data={f.descriptorsArr} id={f.id} />
            </svg>
            <span>
              {f.descriptorsArr
                .map((des) => `${des.type.slice(0, 1)}(${des.text})`)
                .join(' & ')}
            </span>
          </div>

          <div className="info">
            <span>{Math.round(f.proportion * size)}</span>
            <svg width="15px" height="15px" viewBox="0 0 12 12">
              <ProportionBar proportion={f.proportion} />
            </svg>
          </div>
        </div>
      ))}
      <Button text="update" style={btnStyle} onClick={update} />
    </div>
  );
};

export default CohortFeature;
