/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import style from './button.module.css';

interface IButton {
  text: string;
  [key: string]: any;
}

const Button = ({ text, ...props }: IButton) => (
  <div {...props} className={style.button}>
    {text}
  </div>
);

export default Button;
