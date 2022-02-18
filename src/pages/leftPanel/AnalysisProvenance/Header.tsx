import React from 'react';
import style from './Header.module.css';

interface IHeader {
  open: boolean;
  info?: string;
  cnt?: string;
  index: number;
}
const Header = ({ open, info, cnt, index }: IHeader) => (
  <div className={style.header}>
    <div>
      <div
        className={style.indicator}
        {...(open && { style: { transform: 'rotate(-90deg)' } })}
      />

      <span className={style.tag}>{index}</span>
    </div>
    <div className={style.title}>
      <p>Figures</p>
      <div>{info}</div>
      <p>{cnt}</p>
    </div>
  </div>
);

Header.defaultProps = {
  info: '',
  cnt: 200,
};

export default Header;
