// components/AccountantDropDown.tsx
import Image from 'next/image';
import React from 'react';
interface DropdownProps {
  items: string[];
  top: number;
  heading: string;
}

const Dropdown: React.FC<DropdownProps> = ({ items, top, heading }) => (
  <div
    style={{
      position: 'absolute',
      top: top,
      right: 10,
      backgroundColor: 'white',
      border: 'none',
      borderRadius: '4px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      width: '20vw',
      height: 'auto',
      paddingTop: '10px',
      paddingBottom: '40px',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '10px',
        paddingRight: '10px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
        paddingTop: '10px',
      }}
    >
      <h4
        style={{
          fontSize: '17px',
          fontFamily: 'var(--font-Inter)',
          fontWeight: 600,
        }}
      >
        {heading}
      </h4>
      <Image
        alt='Memo icon'
        height={14}
        width={14}
        src='/assets/setting/team/access.svg'
        style={{ cursor: 'pointer' }}
      />
    </div>

    {items.map((item, index) => (
      <div
        key={index}
        style={{
          padding: '8px',
          cursor: 'pointer',
          fontSize: '17px',
          textAlign: 'start',
          paddingLeft: '10px',
          paddingTop: '20px',
          fontFamily: 'var(--font-Inter)',
          fontWeight: 400,
        }}
      >
        {item}
      </div>
    ))}
  </div>
);

export default Dropdown;
