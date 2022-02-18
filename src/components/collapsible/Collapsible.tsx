import React, { useState } from 'react';
import style from './Collapsible.module.css';

interface ICollapse {
  open?: boolean;
  menu: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

const Collapsible = ({ open = false, menu, header, children }: ICollapse) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleFilterOpening = () => {
    setIsOpen((prev) => !prev);
  };

  // onClick={handleFilterOpening}

  return (
    <div className={style.card}>
      {menu}

      <div className="border-bottom">
        <div>{isOpen && <div className="p-3">{children}</div>}</div>
      </div>
    </div>
  );
};

Collapsible.defaultProps = {
  open: false,
};

export default Collapsible;
