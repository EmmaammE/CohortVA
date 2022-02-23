import React, { useState } from 'react';
import { Select } from 'antd';
import { IAtomFeature } from '../../types';
import style from './index.module.scss';

interface IAtomView {
  data: {
    [t: string]: IAtomFeature[];
  };
}

const { Option } = Select;

const selectStyle = { width: 150, margin: '10px 0 5px 0' };
const AtomView = ({ data }: IAtomView) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedAtom, setSelectedAtom] = useState('');

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setSelectedAtom('');
  };

  const handleAtomChange = (value: string) => {
    setSelectedAtom(value);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.menu}>
        <Select
          style={selectStyle}
          placeholder="Include List"
          size="small"
          value={selectedType}
          onChange={handleTypeChange}
        >
          {Object.keys(data).map((value) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>

        <Select
          style={selectStyle}
          placeholder="Include List"
          size="small"
          value={selectedAtom}
          onChange={handleAtomChange}
        >
          {(data[selectedType] || []).map((value) => (
            <Option key={value.id} value={value.id}>
              {value.text}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default AtomView;
