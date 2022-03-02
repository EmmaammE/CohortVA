import React, { useMemo, useState } from 'react';
import style from './tooltip.module.css';

interface ITipInfo {
  content: string;
  left?: number;
  top?: number;
}

const useTooltip = () => {
  const [tipInfo, setTipInfo] = useState<ITipInfo>({ content: '' });

  const element = useMemo(() => {
    if (tipInfo.content === '') return null;

    return (
      <div
        className={style.tip}
        style={{ left: tipInfo.left, top: tipInfo.top }}
      >
        {tipInfo.content}
      </div>
    );
  }, [tipInfo]);

  return {
    element,
    setTipInfo,
  };
};

export default useTooltip;
