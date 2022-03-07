import React from 'react';
import data from '../../../../data/relation.json';
import Matrix from './Matrix';
import style from './index.module.scss';

const size = 500;

const FeatureView = () => (
  <div className={style.container}>
    <div className={style.header} />
    <div className={style.content}>test</div>
    {/* <svg height={size} width={size}> */}
    {/* <Matrix height={size} data={data as any} /> */}
    {/* </svg> */}
  </div>
);

export default FeatureView;
